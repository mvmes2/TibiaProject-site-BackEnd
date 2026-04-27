module.exports = app => {
	const connection = require('../config/dbMasterConf');

	const HOUR_IN_MS = 60 * 60 * 1000;
	const DAY_IN_MS = 24 * 60 * 60 * 1000;
	const THREE_DAYS_IN_MS = 3 * DAY_IN_MS;
	const DEFAULT_BREAKDOWN_LIMIT = 6;
	const DEFAULT_MONSTER_LIMIT = 50;
	const DEFAULT_INTERVENTION_LIMIT = 12;
	const DEFAULT_MONSTER_RECENT_EVENT_LIMIT = 12;
	const RAW_MONSTER_RECENT_EVENT_FETCH_LIMIT = 48;
	const MONSTER_CACHE_TTL_MS = 5 * 60 * 1000;
	const TIME_STORAGE_CACHE_TTL_MS = 5 * 60 * 1000;

	const TIME_STORAGE_MODE = {
		DATETIME: 'datetime',
		EPOCH: 'epoch',
	};

	const CLASS_IDS = {
		FAUCET: 1,
		SINK: 2,
		TRANSFER: 3,
		PENDING: 4,
	};

	const STATE_IDS = {
		PENDING: 1,
		REALIZED: 2,
		DECAYED: 3,
	};

	const MECHANISM_IDS = {
		MONSTER_GOLD_CLAIM: 2,
		MONSTER_GOLD_DECAY_UNCLAIMED: 3,
	};

	const monsterCache = {
		updatedAt: 0,
		data: null,
	};

	const timeStorageCache = {
		updatedAt: 0,
		mode: null,
	};

	const classIdToKey = {
		[CLASS_IDS.FAUCET]: 'FAUCET',
		[CLASS_IDS.SINK]: 'SINK',
		[CLASS_IDS.TRANSFER]: 'TRANSFER',
		[CLASS_IDS.PENDING]: 'PENDING',
	};

	const buildUnicodeCiEqualsCondition = (columnExpression) => `CONVERT(${columnExpression} USING utf8mb4) COLLATE utf8mb4_unicode_ci = CONVERT(? USING utf8mb4) COLLATE utf8mb4_unicode_ci`;

	const toSafeNumber = (value) => {
		if (value === null || value === undefined) {
			return 0;
		}

		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : 0;
	};

	const formatUtcDateTimeForSql = (timestamp) => {
		const date = new Date(toSafeNumber(timestamp));
		if (Number.isNaN(date.getTime())) {
			return null;
		}

		const pad = (value, size = 2) => String(value).padStart(size, '0');

		return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())}.${pad(date.getUTCMilliseconds(), 3)}`;
	};

	const normalizeTimestampResponse = (value) => {
		if (value === null || value === undefined) {
			return null;
		}

		if (typeof value === 'number') {
			return Number.isFinite(value) ? value : null;
		}

		if (value instanceof Date) {
			return Number.isNaN(value.getTime()) ? null : value.getTime();
		}

		const rawValue = String(value).trim();
		if (!rawValue) {
			return null;
		}

		if (/^\d+$/.test(rawValue)) {
			return toSafeNumber(rawValue);
		}

		let normalized = rawValue.replace(' ', 'T');
		normalized = normalized.replace(/\.(\d{3})\d+$/, '.$1');

		if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
			normalized = `${normalized}T00:00:00.000`;
		}

		if (!/[zZ]|[+-]\d{2}:?\d{2}$/.test(normalized)) {
			normalized = `${normalized}Z`;
		}

		const parsed = Date.parse(normalized);
		return Number.isNaN(parsed) ? null : parsed;
	};

	const toSafeTimestamp = (value) => {
		const parsed = normalizeTimestampResponse(value);
		return parsed === null ? 0 : parsed;
	};

	const getAuditTimeStorageMode = async () => {
		const now = Date.now();

		if (timeStorageCache.mode && (now - timeStorageCache.updatedAt) <= TIME_STORAGE_CACHE_TTL_MS) {
			return timeStorageCache.mode;
		}

		const result = await connection.raw("SHOW COLUMNS FROM `gold_audit_event_fact` LIKE 'occurred_at'");
		const rows = Array.isArray(result) ? (Array.isArray(result[0]) ? result[0] : result) : [];
		const columnType = String(rows?.[0]?.Type || '').toLowerCase();
		const mode = /^(bigint|int|mediumint|smallint|tinyint)\b/.test(columnType)
			? TIME_STORAGE_MODE.EPOCH
			: TIME_STORAGE_MODE.DATETIME;

		timeStorageCache.updatedAt = now;
		timeStorageCache.mode = mode;
		return mode;
	};

	const buildRangeBoundValue = (timestamp, timeStorageMode) => {
		if (timeStorageMode === TIME_STORAGE_MODE.EPOCH) {
			return toSafeNumber(timestamp);
		}

		return formatUtcDateTimeForSql(timestamp);
	};

	const buildTimestampSelect = (columnExpression, alias, timeStorageMode) => {
		if (timeStorageMode === TIME_STORAGE_MODE.EPOCH) {
			return connection.raw(`${columnExpression} AS ${alias}`);
		}

		return connection.raw(`DATE_FORMAT(${columnExpression}, '%Y-%m-%d %H:%i:%s.%f') AS ${alias}`);
	};

	const buildRollupBucketSelect = (columnExpression, granularity, timeStorageMode) => {
		if (timeStorageMode === TIME_STORAGE_MODE.EPOCH) {
			return connection.raw(`${columnExpression} AS bucket`);
		}

		const format = granularity === 'hourly' ? '%Y-%m-%d %H:00:00' : '%Y-%m-%d';
		return connection.raw(`DATE_FORMAT(${columnExpression}, '${format}') AS bucket`);
	};

	const buildFactBucketExpression = (columnExpression, granularity, timeStorageMode) => {
		if (timeStorageMode === TIME_STORAGE_MODE.EPOCH) {
			return connection.raw(`(${columnExpression} - MOD(${columnExpression}, ?))`, [granularity === 'hourly' ? HOUR_IN_MS : DAY_IN_MS]);
		}

		return granularity === 'hourly'
			? connection.raw(`DATE_FORMAT(${columnExpression}, '%Y-%m-%d %H:00:00')`)
			: connection.raw(`DATE_FORMAT(${columnExpression}, '%Y-%m-%d')`);
	};

	const formatDbErrorMessage = (err) => {
		if (['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR'].includes(err?.code)) {
			return 'Economy audit tables are not available in the current database.';
		}

		return 'Internal error while loading economy data.';
	};

	const mapServerGoldStockSnapshot = (row) => {
		if (!row) {
			return null;
		}

		return {
			id: row.id === undefined ? null : toSafeNumber(row.id),
			snapshotAt: toSafeTimestamp(row.snapshotAt),
			triggerName: row.triggerName,
			scanDurationMs: toSafeNumber(row.scanDurationMs),
			onlinePlayers: toSafeNumber(row.onlinePlayers),
			offlinePlayers: toSafeNumber(row.offlinePlayers),
			bankGold: toSafeNumber(row.bankGold),
			inventoryGold: toSafeNumber(row.inventoryGold),
			depotGold: toSafeNumber(row.depotGold),
			houseGold: toSafeNumber(row.houseGold),
			worldGold: toSafeNumber(row.worldGold),
			totalGold: toSafeNumber(row.totalGold),
		};
	};

	const buildServerGoldStockBaseQuery = () => connection('gold_server_stock_snapshot').select(
		'id',
		'snapshot_at as snapshotAt',
		'trigger_name as triggerName',
		'scan_duration_ms as scanDurationMs',
		'online_players as onlinePlayers',
		'offline_players as offlinePlayers',
		'bank_gold as bankGold',
		'inventory_gold as inventoryGold',
		'depot_gold as depotGold',
		'house_gold as houseGold',
		'world_gold as worldGold',
		'total_gold as totalGold'
	);

	const loadSingleServerGoldStockSnapshot = async (queryBuilder) => {
		try {
			const row = await queryBuilder.first();
			return mapServerGoldStockSnapshot(row);
		} catch (err) {
			if (['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR'].includes(err?.code)) {
				return null;
			}

			throw err;
		}
	};

	const getLatestServerGoldStockSnapshot = async () => {
		return loadSingleServerGoldStockSnapshot(
			buildServerGoldStockBaseQuery()
				.orderBy('snapshot_at', 'desc')
				.orderBy('id', 'desc')
		);
	};

	const getServerGoldStockHistory = async ({ from, to, granularity }) => {
		try {
			const bucketSize = granularity === 'daily' ? DAY_IN_MS : HOUR_IN_MS;
			const bucketExpression = '(snapshot.snapshot_at - MOD(snapshot.snapshot_at, ?))';

			const latestSnapshotIdsByBucket = connection('gold_server_stock_snapshot as snapshot')
				.where('snapshot.snapshot_at', '>=', from)
				.andWhere('snapshot.snapshot_at', '<', to)
				.select(connection.raw(`${bucketExpression} AS bucket`, [bucketSize]))
				.max({ snapshotId: 'snapshot.id' })
				.groupByRaw(bucketExpression, [bucketSize]);

			const rows = await connection
				.from({ bucketed: latestSnapshotIdsByBucket })
				.join('gold_server_stock_snapshot as snapshot', 'snapshot.id', 'bucketed.snapshotId')
				.select(
					'bucketed.bucket as bucket',
					'snapshot.id as id',
					'snapshot.snapshot_at as snapshotAt',
					'snapshot.trigger_name as triggerName',
					'snapshot.scan_duration_ms as scanDurationMs',
					'snapshot.online_players as onlinePlayers',
					'snapshot.offline_players as offlinePlayers',
					'snapshot.bank_gold as bankGold',
					'snapshot.inventory_gold as inventoryGold',
					'snapshot.depot_gold as depotGold',
					'snapshot.house_gold as houseGold',
					'snapshot.world_gold as worldGold',
					'snapshot.total_gold as totalGold'
				)
				.orderBy('bucketed.bucket', 'asc');

			const points = rows.map((row) => ({
				bucket: toSafeTimestamp(row.bucket),
				...mapServerGoldStockSnapshot(row),
			}));

			const [baselineSnapshot, endSnapshot] = await Promise.all([
				loadSingleServerGoldStockSnapshot(
					buildServerGoldStockBaseQuery()
						.where('snapshot_at', '<=', from)
						.orderBy('snapshot_at', 'desc')
						.orderBy('id', 'desc')
				),
				loadSingleServerGoldStockSnapshot(
					buildServerGoldStockBaseQuery()
						.where('snapshot_at', '<', to)
						.orderBy('snapshot_at', 'desc')
						.orderBy('id', 'desc')
				),
			]);

			const rangeStart = baselineSnapshot || points[0] || null;
			const rangeEnd = endSnapshot || points[points.length - 1] || null;
			const deltaGold = rangeStart && rangeEnd ? (toSafeNumber(rangeEnd.totalGold) - toSafeNumber(rangeStart.totalGold)) : 0;
			const deltaPercent = rangeStart && toSafeNumber(rangeStart.totalGold) > 0
				? (deltaGold / toSafeNumber(rangeStart.totalGold)) * 100
				: null;

			return {
				granularity,
				points,
				rangeSummary: {
					startSnapshot: rangeStart,
					endSnapshot: rangeEnd,
					deltaGold,
					deltaPercent,
				},
			};
		} catch (err) {
			if (['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR'].includes(err?.code)) {
				return {
					granularity,
					points: [],
					rangeSummary: {
						startSnapshot: null,
						endSnapshot: null,
						deltaGold: 0,
						deltaPercent: null,
					},
				};
			}

			throw err;
		}
	};

	const resolveRollupTarget = (from, to, preferredGranularity) => {
		if (preferredGranularity === 'hourly') {
			return {
				granularity: 'hourly',
				tableName: 'gold_audit_rollup_hourly',
				bucketColumn: 'bucket_hour',
			};
		}

		if (preferredGranularity === 'daily') {
			return {
				granularity: 'daily',
				tableName: 'gold_audit_rollup_daily',
				bucketColumn: 'bucket_day',
			};
		}

		const useHourly = (to - from) <= THREE_DAYS_IN_MS;

		return useHourly ? {
			granularity: 'hourly',
			tableName: 'gold_audit_rollup_hourly',
			bucketColumn: 'bucket_hour',
		} : {
			granularity: 'daily',
			tableName: 'gold_audit_rollup_daily',
			bucketColumn: 'bucket_day',
		};
	};

	const applyRange = (query, column, from, to, timeStorageMode) => query
		.where(column, '>=', buildRangeBoundValue(from, timeStorageMode))
		.andWhere(column, '<', buildRangeBoundValue(to, timeStorageMode));

	const cloneWithRange = (tableName, bucketColumn, from, to, timeStorageMode, alias = null) => {
		const target = alias ? `${tableName} as ${alias}` : tableName;
		const query = connection(target);
		return applyRange(query, alias ? `${alias}.${bucketColumn}` : bucketColumn, from, to, timeStorageMode);
	};

	const getSummaryByClass = async (tableName, bucketColumn, from, to, timeStorageMode) => {
		const rows = await cloneWithRange(tableName, bucketColumn, from, to, timeStorageMode)
			.select('class_id')
			.sum({ totalAmount: 'total_amount' })
			.sum({ eventCount: 'event_count' })
			.groupBy('class_id');

		const summary = {
			FAUCET: { totalAmount: 0, eventCount: 0 },
			SINK: { totalAmount: 0, eventCount: 0 },
			TRANSFER: { totalAmount: 0, eventCount: 0 },
			PENDING: { totalAmount: 0, eventCount: 0 },
		};

		rows.forEach((row) => {
			const key = classIdToKey[row.class_id];

			if (!key) {
				return;
			}

			summary[key] = {
				totalAmount: toSafeNumber(row.totalAmount),
				eventCount: toSafeNumber(row.eventCount),
			};
		});

		return summary;
	};

	const buildBreakdownByClass = (rows, idKey, nameKey, limit) => rows.reduce((acc, row) => {
		const classKey = classIdToKey[row.classId] || 'UNKNOWN';

		if (!acc[classKey]) {
			acc[classKey] = [];
		}

		acc[classKey].push({
			[idKey]: toSafeNumber(row[idKey]),
			[nameKey]: row[nameKey],
			totalAmount: toSafeNumber(row.totalAmount),
			eventCount: toSafeNumber(row.eventCount),
		});

		acc[classKey].sort((left, right) => right.totalAmount - left.totalAmount);
		acc[classKey] = acc[classKey].slice(0, limit);
		return acc;
	}, {
		FAUCET: [],
		SINK: [],
		TRANSFER: [],
		PENDING: [],
	});

	const applyMonsterFactFilter = (query, alias, monsterId, normalizedMonsterName) => query.andWhere((builder) => {
		builder.where(`${alias}.monster_dim_id`, monsterId)
			.orWhere((fallbackBuilder) => {
				fallbackBuilder.whereNull(`${alias}.monster_dim_id`)
					.andWhereRaw(buildUnicodeCiEqualsCondition(`${alias}.source_name_snapshot`), [normalizedMonsterName]);
			});
	});

	const applyMonsterPendingFilter = (query, alias, monsterId, normalizedMonsterName) => query.andWhere((builder) => {
		builder.where(`${alias}.monster_dim_id`, monsterId)
			.orWhere((fallbackBuilder) => {
				fallbackBuilder.whereNull(`${alias}.monster_dim_id`)
					.andWhereRaw(buildUnicodeCiEqualsCondition(`${alias}.source_name_snapshot`), [normalizedMonsterName]);
			});
	});

	const buildMonsterRecentEventGroupKey = (event) => {
		const eventType = event.eventType || 'UNKNOWN';
		const sourceRefId = toSafeNumber(event.sourceRefId);
		const looterPlayerId = toSafeNumber(event.looterPlayerId);
		const killerPlayerId = toSafeNumber(event.killerPlayerId);

		if (sourceRefId > 0) {
			return `tracked:${eventType}:${sourceRefId}:${looterPlayerId}:${killerPlayerId}`;
		}

		// Legacy rows may not carry the original pending-group id yet. In that case,
		// only collapse rows that are identical at the event timestamp level.
		return `legacy:${eventType}:${toSafeTimestamp(event.occurredAt)}:${looterPlayerId}:${killerPlayerId}:${String(event.sourceNameSnapshot || '').toLowerCase()}`;
	};

	const collapseMonsterRecentEvents = (rows, limit = DEFAULT_MONSTER_RECENT_EVENT_LIMIT) => {
		const grouped = new Map();

		rows.forEach((row) => {
			const normalizedRow = {
				occurredAt: toSafeTimestamp(row.occurredAt),
				amount: toSafeNumber(row.amount),
				eventType: row.eventType,
				killerPlayerId: row.killerPlayerId ? toSafeNumber(row.killerPlayerId) : null,
				killerPlayerName: row.killerPlayerName,
				looterPlayerId: row.looterPlayerId ? toSafeNumber(row.looterPlayerId) : null,
				looterPlayerName: row.looterPlayerName,
				sourceNameSnapshot: row.sourceNameSnapshot,
				sourceRefId: row.sourceRefId === null ? null : toSafeNumber(row.sourceRefId),
				groupedEventCount: 1,
			};

			const groupKey = buildMonsterRecentEventGroupKey(normalizedRow);
			const current = grouped.get(groupKey);

			if (!current) {
				grouped.set(groupKey, normalizedRow);
				return;
			}

			current.amount += normalizedRow.amount;
			current.groupedEventCount += 1;

			if (normalizedRow.occurredAt > current.occurredAt) {
				current.occurredAt = normalizedRow.occurredAt;
			}

			if (!current.looterPlayerName && normalizedRow.looterPlayerName) {
				current.looterPlayerName = normalizedRow.looterPlayerName;
			}

			if (!current.killerPlayerName && normalizedRow.killerPlayerName) {
				current.killerPlayerName = normalizedRow.killerPlayerName;
			}
		});

		return Array.from(grouped.values())
			.sort((left, right) => right.occurredAt - left.occurredAt)
			.slice(0, limit);
	};

	const getEconomyDashboardRepository = async ({ from, to, granularity, limit = DEFAULT_BREAKDOWN_LIMIT }) => {
		try {
			const resolvedLimit = Math.max(1, Math.min(toSafeNumber(limit) || DEFAULT_BREAKDOWN_LIMIT, 12));
			const timeStorageMode = await getAuditTimeStorageMode();
			const rollupTarget = resolveRollupTarget(from, to, granularity);

			const summaryPromise = getSummaryByClass(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode);

			const seriesPromise = cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode)
				.select(buildRollupBucketSelect(rollupTarget.bucketColumn, rollupTarget.granularity, timeStorageMode))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS faucetAmount', [CLASS_IDS.FAUCET]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS sinkAmount', [CLASS_IDS.SINK]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS transferAmount', [CLASS_IDS.TRANSFER]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN event_count ELSE 0 END) AS faucetEvents', [CLASS_IDS.FAUCET]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN event_count ELSE 0 END) AS sinkEvents', [CLASS_IDS.SINK]))
				.groupBy(rollupTarget.bucketColumn)
				.orderBy(rollupTarget.bucketColumn, 'asc');

			const mechanismRowsPromise = cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode, 'rollup')
				.join('gold_mechanism_dim as mechanism', 'mechanism.id', 'rollup.mechanism_id')
				.select('rollup.class_id as classId', 'mechanism.id as mechanismId', 'mechanism.name as mechanismName')
				.sum({ totalAmount: 'rollup.total_amount' })
				.sum({ eventCount: 'rollup.event_count' })
				.groupBy('rollup.class_id', 'mechanism.id', 'mechanism.name');

			const originRowsPromise = cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode, 'rollup')
				.join('gold_origin_root_dim as origin', 'origin.id', 'rollup.origin_root_id')
				.select('rollup.class_id as classId', 'origin.id as originId', 'origin.name as originName')
				.sum({ totalAmount: 'rollup.total_amount' })
				.sum({ eventCount: 'rollup.event_count' })
				.groupBy('rollup.class_id', 'origin.id', 'origin.name');

			const pendingSummaryPromise = connection('gold_pending_world')
				.where('current_value', '>', 0)
				.select(connection.raw('COUNT(*) AS openEntries'))
				.select(connection.raw('COALESCE(SUM(current_value), 0) AS currentValue'))
				.select(connection.raw('COALESCE(SUM(initial_value), 0) AS initialValue'))
				.first();

			const pendingMonsterRowsPromise = connection('gold_pending_world as pending')
				.leftJoin('gold_monster_dim as monster', 'monster.id', 'pending.monster_dim_id')
				.where('pending.current_value', '>', 0)
				.select(connection.raw('COALESCE(monster.id, 0) AS monsterId'))
				.select(connection.raw("COALESCE(monster.name, pending.source_name_snapshot, 'unknown') AS monsterName"))
				.count({ pendingEntries: '*' })
				.sum({ currentValue: 'pending.current_value' })
				.groupBy('monster.id', 'monster.name', 'pending.source_name_snapshot')
				.orderBy('currentValue', 'desc')
				.limit(resolvedLimit);

			const anomalySummaryPromise = connection('gold_audit_anomaly')
				.select(connection.raw('COUNT(*) AS total'))
				.select(connection.raw('SUM(CASE WHEN severity >= 4 THEN 1 ELSE 0 END) AS criticalCount'))
				.select(connection.raw('SUM(CASE WHEN severity >= 3 THEN 1 ELSE 0 END) AS highCount'))
				.first();

			const recentAnomaliesPromise = connection('gold_audit_anomaly')
				.select('id', buildTimestampSelect('created_at', 'createdAt', timeStorageMode), 'severity', 'player_id as playerId', 'mechanism_id as mechanismId', 'code', 'notes')
				.orderBy('created_at', 'desc')
				.limit(resolvedLimit);

			const interventionSummaryPromise = applyRange(connection('gold_audit_admin_intervention_v as intervention'), 'intervention.occurred_at', from, to, timeStorageMode)
				.select(connection.raw('COUNT(*) AS totalEvents'))
				.select(connection.raw('COALESCE(SUM(amount), 0) AS totalAmount'))
				.select(connection.raw(`COALESCE(SUM(CASE WHEN ${buildUnicodeCiEqualsCondition('intervention.event_class')} THEN amount ELSE 0 END), 0) AS faucetAmount`, ['FAUCET']))
				.select(connection.raw(`COALESCE(SUM(CASE WHEN ${buildUnicodeCiEqualsCondition('intervention.event_class')} THEN amount ELSE 0 END), 0) AS sinkAmount`, ['SINK']))
				.first();

			const stockSnapshotPromise = getLatestServerGoldStockSnapshot();
			const stockHistoryPromise = getServerGoldStockHistory({ from, to, granularity: rollupTarget.granularity });

			const recentInterventionsPromise = applyRange(connection('gold_audit_admin_intervention_v as intervention'), 'intervention.occurred_at', from, to, timeStorageMode)
				.select(
					'record_source as recordSource',
					'source_row_id as sourceRowId',
					buildTimestampSelect('occurred_at', 'occurredAt', timeStorageMode),
					'event_class as eventClass',
					'mechanism_name as mechanismName',
					'actor_player_id as actorPlayerId',
					'actor_player_name as actorPlayerName',
					'subject_player_id as subjectPlayerId',
					'subject_player_name as subjectPlayerName',
					'amount',
					'inventory_delta as inventoryDelta',
					'bank_delta as bankDelta',
					'balance_before as balanceBefore',
					'balance_after as balanceAfter',
					'source_ref_id as sourceRefId',
					'source_name_snapshot as sourceNameSnapshot',
					'db_source_context as dbSourceContext',
					'db_user as dbUser',
					'db_current_user as dbCurrentUser',
					'db_connection_id as dbConnectionId'
				)
				.orderBy('intervention.occurred_at', 'desc')
				.limit(resolvedLimit);

			const [
				summary,
				seriesRows,
				mechanismRows,
				originRows,
				pendingSummary,
				pendingMonsterRows,
				anomalySummary,
				recentAnomalies,
				interventionSummary,
				recentInterventions,
				stockSnapshot,
				stockHistory,
			] = await Promise.all([
				summaryPromise,
				seriesPromise,
				mechanismRowsPromise,
				originRowsPromise,
				pendingSummaryPromise,
				pendingMonsterRowsPromise,
				anomalySummaryPromise,
				recentAnomaliesPromise,
				interventionSummaryPromise,
				recentInterventionsPromise,
				stockSnapshotPromise,
				stockHistoryPromise,
			]);

			const topMechanisms = buildBreakdownByClass(mechanismRows, 'mechanismId', 'mechanismName', resolvedLimit);
			const topOrigins = buildBreakdownByClass(originRows, 'originId', 'originName', resolvedLimit);

			const decayMechanism = mechanismRows.find((row) => toSafeNumber(row.mechanismId) === MECHANISM_IDS.MONSTER_GOLD_DECAY_UNCLAIMED);

			return {
				status: 200,
				message: {
					range: {
						from,
						to,
						granularity: rollupTarget.granularity,
					},
					summary: {
						totalServerGold: toSafeNumber(stockSnapshot?.totalGold),
						generatedGold: summary.FAUCET.totalAmount,
						generatedEvents: summary.FAUCET.eventCount,
						burnedGold: summary.SINK.totalAmount,
						burnedEvents: summary.SINK.eventCount,
						transferredGold: summary.TRANSFER.totalAmount,
						transferredEvents: summary.TRANSFER.eventCount,
						netGold: summary.FAUCET.totalAmount - summary.SINK.totalAmount,
						pendingGoldNow: toSafeNumber(pendingSummary?.currentValue),
						pendingGoldInitial: toSafeNumber(pendingSummary?.initialValue),
						pendingEntries: toSafeNumber(pendingSummary?.openEntries),
						decayGold: toSafeNumber(decayMechanism?.totalAmount),
						anomalyCount: toSafeNumber(anomalySummary?.total),
						criticalAnomalyCount: toSafeNumber(anomalySummary?.criticalCount),
						highAnomalyCount: toSafeNumber(anomalySummary?.highCount),
						interventionCount: toSafeNumber(interventionSummary?.totalEvents),
						interventionVolume: toSafeNumber(interventionSummary?.totalAmount),
						interventionFaucetVolume: toSafeNumber(interventionSummary?.faucetAmount),
						interventionSinkVolume: toSafeNumber(interventionSummary?.sinkAmount),
					},
					stock: stockSnapshot ? {
						snapshotAt: toSafeTimestamp(stockSnapshot.snapshotAt),
						triggerName: stockSnapshot.triggerName,
						scanDurationMs: toSafeNumber(stockSnapshot.scanDurationMs),
						onlinePlayers: toSafeNumber(stockSnapshot.onlinePlayers),
						offlinePlayers: toSafeNumber(stockSnapshot.offlinePlayers),
						bankGold: toSafeNumber(stockSnapshot.bankGold),
						inventoryGold: toSafeNumber(stockSnapshot.inventoryGold),
						depotGold: toSafeNumber(stockSnapshot.depotGold),
						houseGold: toSafeNumber(stockSnapshot.houseGold),
						worldGold: toSafeNumber(stockSnapshot.worldGold),
						totalGold: toSafeNumber(stockSnapshot.totalGold),
					} : null,
					stockHistory: {
						granularity: stockHistory?.granularity || rollupTarget.granularity,
						points: (stockHistory?.points || []).map((point) => ({
							bucket: toSafeTimestamp(point.bucket),
							snapshotAt: toSafeTimestamp(point.snapshotAt),
							triggerName: point.triggerName,
							bankGold: toSafeNumber(point.bankGold),
							inventoryGold: toSafeNumber(point.inventoryGold),
							depotGold: toSafeNumber(point.depotGold),
							houseGold: toSafeNumber(point.houseGold),
							worldGold: toSafeNumber(point.worldGold),
							totalGold: toSafeNumber(point.totalGold),
						})),
						rangeSummary: {
							startSnapshot: stockHistory?.rangeSummary?.startSnapshot ? {
								snapshotAt: toSafeTimestamp(stockHistory.rangeSummary.startSnapshot.snapshotAt),
								triggerName: stockHistory.rangeSummary.startSnapshot.triggerName,
								totalGold: toSafeNumber(stockHistory.rangeSummary.startSnapshot.totalGold),
							} : null,
							endSnapshot: stockHistory?.rangeSummary?.endSnapshot ? {
								snapshotAt: toSafeTimestamp(stockHistory.rangeSummary.endSnapshot.snapshotAt),
								triggerName: stockHistory.rangeSummary.endSnapshot.triggerName,
								totalGold: toSafeNumber(stockHistory.rangeSummary.endSnapshot.totalGold),
							} : null,
							deltaGold: toSafeNumber(stockHistory?.rangeSummary?.deltaGold),
							deltaPercent: stockHistory?.rangeSummary?.deltaPercent === null || stockHistory?.rangeSummary?.deltaPercent === undefined
								? null
								: Number(stockHistory.rangeSummary.deltaPercent),
						},
					},
					series: seriesRows.map((row) => ({
						bucket: toSafeTimestamp(row.bucket),
						faucetAmount: toSafeNumber(row.faucetAmount),
						sinkAmount: toSafeNumber(row.sinkAmount),
						transferAmount: toSafeNumber(row.transferAmount),
						faucetEvents: toSafeNumber(row.faucetEvents),
						sinkEvents: toSafeNumber(row.sinkEvents),
						netAmount: toSafeNumber(row.faucetAmount) - toSafeNumber(row.sinkAmount),
					})),
					breakdowns: {
						mechanisms: topMechanisms,
						origins: topOrigins,
					},
					pending: {
						topMonsters: pendingMonsterRows.map((row) => ({
							monsterId: toSafeNumber(row.monsterId),
							monsterName: row.monsterName,
							pendingEntries: toSafeNumber(row.pendingEntries),
							currentValue: toSafeNumber(row.currentValue),
						})),
					},
					anomalies: {
						recent: recentAnomalies.map((row) => ({
							id: toSafeNumber(row.id),
							createdAt: toSafeTimestamp(row.createdAt),
							severity: toSafeNumber(row.severity),
							playerId: row.playerId ? toSafeNumber(row.playerId) : null,
							mechanismId: row.mechanismId ? toSafeNumber(row.mechanismId) : null,
							code: row.code,
							notes: row.notes,
						})),
					},
					interventions: {
						recent: recentInterventions.map((row) => ({
							recordSource: row.recordSource,
							sourceRowId: toSafeNumber(row.sourceRowId),
							occurredAt: toSafeTimestamp(row.occurredAt),
							eventClass: row.eventClass,
							mechanismName: row.mechanismName,
							actorPlayerId: row.actorPlayerId ? toSafeNumber(row.actorPlayerId) : null,
							actorPlayerName: row.actorPlayerName,
							subjectPlayerId: row.subjectPlayerId ? toSafeNumber(row.subjectPlayerId) : null,
							subjectPlayerName: row.subjectPlayerName,
							amount: toSafeNumber(row.amount),
							inventoryDelta: toSafeNumber(row.inventoryDelta),
							bankDelta: toSafeNumber(row.bankDelta),
							balanceBefore: row.balanceBefore === null ? null : toSafeNumber(row.balanceBefore),
							balanceAfter: row.balanceAfter === null ? null : toSafeNumber(row.balanceAfter),
							sourceRefId: row.sourceRefId === null ? null : toSafeNumber(row.sourceRefId),
							sourceNameSnapshot: row.sourceNameSnapshot,
							dbSourceContext: row.dbSourceContext,
							dbUser: row.dbUser,
							dbCurrentUser: row.dbCurrentUser,
							dbConnectionId: row.dbConnectionId === null ? null : toSafeNumber(row.dbConnectionId),
						})),
					},
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyDashboardRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyMonstersRepository = async () => {
		const now = Date.now();

		if (monsterCache.data && (now - monsterCache.updatedAt) <= MONSTER_CACHE_TTL_MS) {
			return { status: 200, message: monsterCache.data };
		}

		try {
			const monsters = await connection('gold_monster_dim')
				.select('id', 'name', 'normalized_name as normalizedName')
				.orderBy('name', 'asc');

			const payload = monsters.map((monster) => ({
				id: toSafeNumber(monster.id),
				name: monster.name,
				normalizedName: monster.normalizedName,
			}));

			monsterCache.updatedAt = now;
			monsterCache.data = payload;

			return { status: 200, message: payload };
		} catch (err) {
			console.log('[EconomyRepository] getEconomyMonstersRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyMonsterRankingRepository = async ({ from, to, limit = DEFAULT_MONSTER_LIMIT }) => {
		try {
			const resolvedLimit = Math.max(1, Math.min(toSafeNumber(limit) || DEFAULT_MONSTER_LIMIT, 100));
			const timeStorageMode = await getAuditTimeStorageMode();

			const rows = await applyRange(connection('gold_audit_event_fact as fact'), 'fact.occurred_at', from, to, timeStorageMode)
				.leftJoin('gold_monster_dim as monster', 'monster.id', 'fact.monster_dim_id')
				.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM)
				.andWhere('fact.state_id', STATE_IDS.REALIZED)
				.select(connection.raw('COALESCE(monster.id, 0) AS monsterId'))
				.select(connection.raw('COALESCE(monster.name, fact.source_name_snapshot, "unknown") AS monsterName'))
				.sum({ realizedGold: 'fact.amount' })
				.count({ claimEvents: '*' })
				.countDistinct({ uniqueLooters: 'fact.looter_player_id' })
				.groupBy('monster.id', 'monster.name', 'fact.source_name_snapshot')
				.orderBy('realizedGold', 'desc')
				.limit(resolvedLimit);

			return {
				status: 200,
				message: {
					from,
					to,
					items: rows.map((row, index) => ({
						rank: index + 1,
						monsterId: toSafeNumber(row.monsterId),
						monsterName: row.monsterName,
						realizedGold: toSafeNumber(row.realizedGold),
						claimEvents: toSafeNumber(row.claimEvents),
						uniqueLooters: toSafeNumber(row.uniqueLooters),
					})),
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyMonsterRankingRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyMonsterDetailsRepository = async (monsterId, { from, to, granularity }) => {
		try {
			const monster = await connection('gold_monster_dim')
				.select('id', 'name', 'normalized_name as normalizedName')
				.where('id', monsterId)
				.first();

			if (!monster) {
				return { status: 404, message: 'Monster not found.' };
			}

			const timeStorageMode = await getAuditTimeStorageMode();
			const rollupTarget = resolveRollupTarget(from, to, granularity);

			const realizedBaseQuery = connection('gold_audit_event_fact as fact')
				.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM)
				.andWhere('fact.state_id', STATE_IDS.REALIZED);

			applyRange(realizedBaseQuery, 'fact.occurred_at', from, to, timeStorageMode);
			applyMonsterFactFilter(realizedBaseQuery, 'fact', monsterId, monster.normalizedName);

			const decayBaseQuery = connection('gold_audit_event_fact as fact')
				.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_DECAY_UNCLAIMED)
				.andWhere('fact.state_id', STATE_IDS.DECAYED);

			applyRange(decayBaseQuery, 'fact.occurred_at', from, to, timeStorageMode);
			applyMonsterFactFilter(decayBaseQuery, 'fact', monsterId, monster.normalizedName);

			const pendingBaseQuery = connection('gold_pending_world as pending')
				.where('pending.current_value', '>', 0);

			applyMonsterPendingFilter(pendingBaseQuery, 'pending', monsterId, monster.normalizedName);

			const realizedTotalsPromise = realizedBaseQuery.clone()
				.select(connection.raw('COALESCE(SUM(fact.amount), 0) AS realizedGold'))
				.select(connection.raw('COUNT(*) AS claimEvents'))
				.select(connection.raw('COUNT(DISTINCT fact.looter_player_id) AS uniqueLooters'))
				.first();

			const decayTotalsPromise = decayBaseQuery.clone()
				.select(connection.raw('COALESCE(SUM(fact.amount), 0) AS decayedGold'))
				.select(connection.raw('COUNT(*) AS decayEvents'))
				.first();

			const pendingTotalsPromise = pendingBaseQuery.clone()
				.select(connection.raw('COALESCE(SUM(pending.current_value), 0) AS pendingGoldNow'))
				.select(connection.raw('COUNT(*) AS pendingEntries'))
				.first();

			const bucketExpression = buildFactBucketExpression('fact.occurred_at', rollupTarget.granularity, timeStorageMode);

			const realizedSeriesPromise = realizedBaseQuery.clone()
				.select({ bucket: bucketExpression })
				.sum({ realizedGold: 'fact.amount' })
				.count({ claimEvents: '*' })
				.groupBy('bucket')
				.orderBy('bucket', 'asc');

			const decaySeriesPromise = decayBaseQuery.clone()
				.select({ bucket: bucketExpression })
				.sum({ decayedGold: 'fact.amount' })
				.count({ decayEvents: '*' })
				.groupBy('bucket')
				.orderBy('bucket', 'asc');

			const topLootersPromise = realizedBaseQuery.clone()
				.leftJoin('players as looter', 'looter.id', 'fact.looter_player_id')
				.select('fact.looter_player_id as looterPlayerId', 'looter.name as looterPlayerName')
				.sum({ realizedGold: 'fact.amount' })
				.count({ claimEvents: '*' })
				.groupBy('fact.looter_player_id', 'looter.name')
				.orderBy('realizedGold', 'desc')
				.limit(8);

			const recentEventsPromise = connection('gold_audit_event_fact as fact')
				.leftJoin('players as killer', 'killer.id', 'fact.killer_player_id')
				.leftJoin('players as looter', 'looter.id', 'fact.looter_player_id')
				.select(
					buildTimestampSelect('fact.occurred_at', 'occurredAt', timeStorageMode),
					'fact.amount',
					'fact.source_ref_id as sourceRefId',
					'fact.killer_player_id as killerPlayerId',
					'killer.name as killerPlayerName',
					'fact.looter_player_id as looterPlayerId',
					'looter.name as looterPlayerName',
					'fact.source_name_snapshot as sourceNameSnapshot'
				)
				.select(connection.raw('CASE WHEN fact.mechanism_id = ? THEN "REALIZED" ELSE "DECAYED" END AS eventType', [MECHANISM_IDS.MONSTER_GOLD_CLAIM]))
				.where((builder) => {
					builder.where((claimBuilder) => {
						claimBuilder.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM)
							.andWhere('fact.state_id', STATE_IDS.REALIZED);
					}).orWhere((decayBuilder) => {
						decayBuilder.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_DECAY_UNCLAIMED)
							.andWhere('fact.state_id', STATE_IDS.DECAYED);
					});
				});

			applyRange(recentEventsPromise, 'fact.occurred_at', from, to, timeStorageMode);
			applyMonsterFactFilter(recentEventsPromise, 'fact', monsterId, monster.normalizedName);

			recentEventsPromise.orderBy('fact.occurred_at', 'desc').limit(RAW_MONSTER_RECENT_EVENT_FETCH_LIMIT);

			const [
				realizedTotals,
				decayTotals,
				pendingTotals,
				realizedSeries,
				decaySeries,
				topLooters,
				recentEvents,
			] = await Promise.all([
				realizedTotalsPromise,
				decayTotalsPromise,
				pendingTotalsPromise,
				realizedSeriesPromise,
				decaySeriesPromise,
				topLootersPromise,
				recentEventsPromise,
			]);

			const mergedSeriesMap = new Map();

			realizedSeries.forEach((row) => {
				const bucket = toSafeTimestamp(row.bucket);
				mergedSeriesMap.set(String(bucket), {
					bucket,
					realizedGold: toSafeNumber(row.realizedGold),
					claimEvents: toSafeNumber(row.claimEvents),
					decayedGold: 0,
					decayEvents: 0,
				});
			});

			decaySeries.forEach((row) => {
				const bucket = toSafeTimestamp(row.bucket);
				const key = String(bucket);
				const current = mergedSeriesMap.get(key) || {
					bucket,
					realizedGold: 0,
					claimEvents: 0,
					decayedGold: 0,
					decayEvents: 0,
				};

				current.decayedGold = toSafeNumber(row.decayedGold);
				current.decayEvents = toSafeNumber(row.decayEvents);
				mergedSeriesMap.set(key, current);
			});

			const mergedSeries = Array.from(mergedSeriesMap.values())
				.sort((left, right) => left.bucket - right.bucket);

			const collapsedRecentEvents = collapseMonsterRecentEvents(recentEvents);

			return {
				status: 200,
				message: {
					range: {
						from,
						to,
						granularity: rollupTarget.granularity,
					},
					monsterId: toSafeNumber(monster.id),
					monsterName: monster.name,
					totals: {
						realizedGold: toSafeNumber(realizedTotals?.realizedGold),
						claimEvents: toSafeNumber(realizedTotals?.claimEvents),
						uniqueLooters: toSafeNumber(realizedTotals?.uniqueLooters),
						decayedGold: toSafeNumber(decayTotals?.decayedGold),
						decayEvents: toSafeNumber(decayTotals?.decayEvents),
						pendingGoldNow: toSafeNumber(pendingTotals?.pendingGoldNow),
						pendingEntries: toSafeNumber(pendingTotals?.pendingEntries),
					},
					series: mergedSeries,
					topLooters: topLooters.map((row) => ({
						looterPlayerId: row.looterPlayerId ? toSafeNumber(row.looterPlayerId) : null,
						looterPlayerName: row.looterPlayerName || 'Unknown player',
						realizedGold: toSafeNumber(row.realizedGold),
						claimEvents: toSafeNumber(row.claimEvents),
					})),
					recentEvents: collapsedRecentEvents.map((row) => ({
						occurredAt: row.occurredAt,
						amount: row.amount,
						eventType: row.eventType,
						killerPlayerId: row.killerPlayerId,
						killerPlayerName: row.killerPlayerName,
						looterPlayerId: row.looterPlayerId,
						looterPlayerName: row.looterPlayerName,
						sourceNameSnapshot: row.sourceNameSnapshot,
						sourceRefId: row.sourceRefId,
						groupedEventCount: row.groupedEventCount,
					})),
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyMonsterDetailsRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyInterventionsRepository = async ({ from, to, limit = DEFAULT_INTERVENTION_LIMIT }) => {
		try {
			const resolvedLimit = Math.max(1, Math.min(toSafeNumber(limit) || DEFAULT_INTERVENTION_LIMIT, 100));
			const timeStorageMode = await getAuditTimeStorageMode();

			const summaryPromise = applyRange(connection('gold_audit_admin_intervention_v as intervention'), 'intervention.occurred_at', from, to, timeStorageMode)
				.select(connection.raw('COUNT(*) AS totalEvents'))
				.select(connection.raw('COALESCE(SUM(amount), 0) AS totalAmount'))
				.select(connection.raw(`COALESCE(SUM(CASE WHEN ${buildUnicodeCiEqualsCondition('intervention.event_class')} THEN amount ELSE 0 END), 0) AS faucetAmount`, ['FAUCET']))
				.select(connection.raw(`COALESCE(SUM(CASE WHEN ${buildUnicodeCiEqualsCondition('intervention.event_class')} THEN amount ELSE 0 END), 0) AS sinkAmount`, ['SINK']))
				.first();

			const itemsPromise = applyRange(connection('gold_audit_admin_intervention_v as intervention'), 'intervention.occurred_at', from, to, timeStorageMode)
				.select(
					'record_source as recordSource',
					'source_row_id as sourceRowId',
					buildTimestampSelect('occurred_at', 'occurredAt', timeStorageMode),
					'event_class as eventClass',
					'mechanism_name as mechanismName',
					'actor_player_id as actorPlayerId',
					'actor_player_name as actorPlayerName',
					'subject_player_id as subjectPlayerId',
					'subject_player_name as subjectPlayerName',
					'amount',
					'inventory_delta as inventoryDelta',
					'bank_delta as bankDelta',
					'balance_before as balanceBefore',
					'balance_after as balanceAfter',
					'source_ref_id as sourceRefId',
					'source_name_snapshot as sourceNameSnapshot',
					'db_source_context as dbSourceContext',
					'db_user as dbUser',
					'db_current_user as dbCurrentUser',
					'db_connection_id as dbConnectionId'
				)
				.orderBy('intervention.occurred_at', 'desc')
				.limit(resolvedLimit);

			const [summary, items] = await Promise.all([summaryPromise, itemsPromise]);

			return {
				status: 200,
				message: {
					from,
					to,
					summary: {
						totalEvents: toSafeNumber(summary?.totalEvents),
						totalAmount: toSafeNumber(summary?.totalAmount),
						faucetAmount: toSafeNumber(summary?.faucetAmount),
						sinkAmount: toSafeNumber(summary?.sinkAmount),
					},
					items: items.map((row) => ({
						recordSource: row.recordSource,
						sourceRowId: toSafeNumber(row.sourceRowId),
						occurredAt: toSafeTimestamp(row.occurredAt),
						eventClass: row.eventClass,
						mechanismName: row.mechanismName,
						actorPlayerId: row.actorPlayerId ? toSafeNumber(row.actorPlayerId) : null,
						actorPlayerName: row.actorPlayerName,
						subjectPlayerId: row.subjectPlayerId ? toSafeNumber(row.subjectPlayerId) : null,
						subjectPlayerName: row.subjectPlayerName,
						amount: toSafeNumber(row.amount),
						inventoryDelta: toSafeNumber(row.inventoryDelta),
						bankDelta: toSafeNumber(row.bankDelta),
						balanceBefore: row.balanceBefore === null ? null : toSafeNumber(row.balanceBefore),
						balanceAfter: row.balanceAfter === null ? null : toSafeNumber(row.balanceAfter),
						sourceRefId: row.sourceRefId === null ? null : toSafeNumber(row.sourceRefId),
						sourceNameSnapshot: row.sourceNameSnapshot,
						dbSourceContext: row.dbSourceContext,
						dbUser: row.dbUser,
						dbCurrentUser: row.dbCurrentUser,
						dbConnectionId: row.dbConnectionId === null ? null : toSafeNumber(row.dbConnectionId),
					})),
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyInterventionsRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	// Phase 4: per-player drill-down for the dashboard cards (bank / inventory / depot / houses).
	// Each compartment returns a paginated list (15 per page) of players ranked by gold value DESC.
	// Worth multipliers follow item type: 3031 = gold coin (1), 3035 = platinum coin (100), 3043 = crystal coin (10000).
	const COIN_ITEM_TYPES = [3031, 3035, 3043];
	const PAGE_SIZE = 15;

	const goldExpression = "SUM(CASE itemtype WHEN 3043 THEN count*10000 WHEN 3035 THEN count*100 WHEN 3031 THEN count ELSE 0 END)";

	const buildPagination = (page) => {
		const safePage = Math.max(1, Number(page) || 1);
		return { offset: (safePage - 1) * PAGE_SIZE, limit: PAGE_SIZE, page: safePage };
	};

	const wrapList = (rows, totalCount, page) => ({
		page,
		pageSize: PAGE_SIZE,
		totalCount,
		totalPages: Math.max(1, Math.ceil(totalCount / PAGE_SIZE)),
		rows,
	});

	const getEconomyBreakdownRepository = async (compartment, { page = 1 } = {}) => {
		const pagination = buildPagination(page);

		try {
			if (compartment === 'bank') {
				const baseQuery = connection('players').where('balance', '>', 0);
				const [{ total }] = await baseQuery.clone().count({ total: 'id' });
				const rows = await connection('players')
					.select('id as playerId', 'name as playerName', 'level', 'balance as gold')
					.where('balance', '>', 0)
					.orderBy('balance', 'desc')
					.limit(pagination.limit)
					.offset(pagination.offset);
				return { status: 200, message: wrapList(rows.map(r => ({ ...r, gold: Number(r.gold) || 0 })), Number(total) || 0, pagination.page) };
			}

			if (compartment === 'inventory' || compartment === 'depot') {
				const sourceTable = compartment === 'inventory' ? 'player_items' : 'player_depotitems';
				const aggregate = connection(sourceTable)
					.select('player_id')
					.whereIn('itemtype', COIN_ITEM_TYPES)
					.groupBy('player_id')
					.havingRaw(`${goldExpression} > 0`)
					.select(connection.raw(`${goldExpression} as gold`));

				const totalRowsResult = await connection.raw(
					`SELECT COUNT(*) AS total FROM (${aggregate.toString()}) AS sub`
				);
				const totalCount = Number((totalRowsResult[0] || [{}])[0]?.total) || 0;

				const rows = await connection(sourceTable + ' as ci')
					.select('p.id as playerId', 'p.name as playerName', 'p.level')
					.select(connection.raw(`${goldExpression.replace(/itemtype/g, 'ci.itemtype').replace(/count/g, 'ci.count')} as gold`))
					.innerJoin('players as p', 'p.id', 'ci.player_id')
					.whereIn('ci.itemtype', COIN_ITEM_TYPES)
					.groupBy('ci.player_id', 'p.id', 'p.name', 'p.level')
					.havingRaw(`${goldExpression.replace(/itemtype/g, 'ci.itemtype').replace(/count/g, 'ci.count')} > 0`)
					.orderBy('gold', 'desc')
					.limit(pagination.limit)
					.offset(pagination.offset);

				return { status: 200, message: wrapList(rows.map(r => ({ ...r, gold: Number(r.gold) || 0 })), totalCount, pagination.page) };
			}

			if (compartment === 'houses') {
				// We rank houses by the gold their owner carries (bank + offline coin items) so the
				// admin can prioritise outliers. The world-snapshot has total houseGold but does not
				// break it down per player; this gives a useful 'who can afford / hoards' view.
				const baseQuery = connection('houses as h')
					.innerJoin('players as p', 'p.id', 'h.owner')
					.where('h.owner', '>', 0);

				const [{ total }] = await baseQuery.clone().count({ total: 'h.id' });

				const rows = await connection.raw(
					`SELECT h.id AS houseId, h.name AS houseName, h.rent AS rent,
					        h.size AS size, h.beds AS beds, p.id AS playerId, p.name AS playerName, p.level,
					        p.balance AS bankGold,
					        COALESCE((SELECT ${goldExpression} FROM player_items WHERE player_id = p.id AND itemtype IN (3031,3035,3043)), 0) AS inventoryGold,
					        COALESCE((SELECT ${goldExpression} FROM player_depotitems WHERE player_id = p.id AND itemtype IN (3031,3035,3043)), 0) AS depotGold
					 FROM houses h
					 INNER JOIN players p ON p.id = h.owner
					 WHERE h.owner > 0
					 ORDER BY p.balance DESC, p.name ASC
					 LIMIT ? OFFSET ?`,
					[pagination.limit, pagination.offset]
				);
				const list = (rows[0] || []).map(r => {
					const bank = Number(r.bankGold) || 0;
					const inv = Number(r.inventoryGold) || 0;
					const depot = Number(r.depotGold) || 0;
					return {
						houseId: r.houseId,
						houseName: r.houseName,
						rent: Number(r.rent) || 0,
						size: Number(r.size) || 0,
						beds: Number(r.beds) || 0,
						playerId: r.playerId,
						playerName: r.playerName,
						level: Number(r.level) || 0,
						bankGold: bank,
						inventoryGold: inv,
						depotGold: depot,
						ownerTotalGold: bank + inv + depot,
					};
				});
				return { status: 200, message: wrapList(list, Number(total) || 0, pagination.page) };
			}

			return { status: 400, message: `Unsupported compartment: ${compartment}` };
		} catch (err) {
			console.log('[EconomyRepository] getEconomyBreakdownRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyTransfersRepository = async ({ from, to, page = 1 } = {}) => {
		const pagination = buildPagination(page);

		try {
			const timeStorageMode = await getAuditTimeStorageMode();
			const baseQuery = () => applyRange(
				connection('gold_audit_event_fact as fact'),
				'fact.occurred_at',
				from,
				to,
				timeStorageMode
			).where('fact.class_id', CLASS_IDS.TRANSFER);

			const [{ total }] = await baseQuery().count({ total: '*' });

			const rows = await baseQuery()
				.leftJoin('players as sender', 'sender.id', 'fact.actor_player_id')
				.leftJoin('players as beneficiary', 'beneficiary.id', 'fact.beneficiary_player_id')
				.leftJoin('players as counterparty', 'counterparty.id', 'fact.counterparty_player_id')
				.leftJoin('gold_mechanism_dim as mechanism', 'mechanism.id', 'fact.mechanism_id')
				.select(
					'fact.boot_id as bootId',
					'fact.event_seq as eventSeq',
					buildTimestampSelect('fact.occurred_at', 'occurredAt', timeStorageMode),
					'fact.amount',
					'fact.actor_player_id as senderPlayerId',
					'sender.name as senderPlayerName',
					'fact.beneficiary_player_id as beneficiaryPlayerId',
					'beneficiary.name as beneficiaryPlayerName',
					'fact.counterparty_player_id as counterpartyPlayerId',
					'counterparty.name as counterpartyPlayerName',
					'mechanism.name as mechanismName'
				)
				.orderBy('fact.amount', 'desc')
				.orderBy('fact.occurred_at', 'desc')
				.limit(pagination.limit)
				.offset(pagination.offset);

			const list = rows.map((row) => ({
				eventId: `${row.bootId}-${row.eventSeq}`,
				occurredAt: toSafeTimestamp(row.occurredAt),
				amount: Number(row.amount) || 0,
				senderPlayerId: row.senderPlayerId ? Number(row.senderPlayerId) : null,
				senderPlayerName: row.senderPlayerName || null,
				recipientPlayerId: row.beneficiaryPlayerId
					? Number(row.beneficiaryPlayerId)
					: row.counterpartyPlayerId
						? Number(row.counterpartyPlayerId)
						: null,
				recipientPlayerName: row.beneficiaryPlayerName || row.counterpartyPlayerName || null,
				mechanismName: row.mechanismName || null,
			}));

			return { status: 200, message: wrapList(list, Number(total) || 0, pagination.page) };
		} catch (err) {
			console.log('[EconomyRepository] getEconomyTransfersRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	return {
		getEconomyDashboardRepository,
		getEconomyMonstersRepository,
		getEconomyMonsterRankingRepository,
		getEconomyMonsterDetailsRepository,
		getEconomyInterventionsRepository,
		getEconomyBreakdownRepository,
		getEconomyTransfersRepository,
	};
};
