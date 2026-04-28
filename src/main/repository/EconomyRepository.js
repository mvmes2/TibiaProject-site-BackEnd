module.exports = app => {
	const connection = require('../config/dbMasterConf');
	const { vocationsArr } = require('../utils/utilities');

	const HOUR_IN_MS = 60 * 60 * 1000;
	const DAY_IN_MS = 24 * 60 * 60 * 1000;
	const THREE_DAYS_IN_MS = 3 * DAY_IN_MS;
	const DEFAULT_BREAKDOWN_LIMIT = 6;
	const DEFAULT_MONSTER_LIMIT = 50;
	const DEFAULT_INTERVENTION_LIMIT = 12;
	const DEFAULT_MONSTER_RECENT_EVENT_LIMIT = 12;
	const RAW_MONSTER_RECENT_EVENT_FETCH_LIMIT = 48;
	const PLAYER_FINANCIAL_HISTORY_PAGE_SIZE = 30;
	const PUNISHMENT_RECORD_LIMIT = 20;
	const PUNISHMENT_SOURCE_FINGERPRINT_MAX_LENGTH = 191;
	const PLAYER_FINANCIAL_HISTORY_VIEW_MODE = {
		GROUPED: 'grouped',
		DETAILED: 'detailed',
	};
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
		HOUSE_TRADE_TRANSFER: 16,
		BANK_DEPOSIT: 18,
		BANK_WITHDRAW: 19,
		BANK_TRANSFER_PLAYER: 20,
		ADMIN_COMMAND_GOLD_GRANT: 24,
		ADMIN_CREATED_GOLD_HANDOFF: 31,
		PARCEL_TRANSFER_PLAYER: 32,
		PLAYER_TRADE_TRANSFER: 33,
	};

	// Mecanismos que representam transferencia REAL entre dois jogadores diferentes.
	// Self-bank (BANK_DEPOSIT/BANK_WITHDRAW) e ADMIN_CREATED_GOLD_HANDOFF (criacao
	// de gold pela staff que so trocou de dono no chao) NAO entram aqui. O handoff
	// administrativo aparece apenas no painel de intervencoes administrativas.
	const REAL_PLAYER_TRANSFER_MECHANISM_IDS = [
		MECHANISM_IDS.BANK_TRANSFER_PLAYER,
		MECHANISM_IDS.HOUSE_TRADE_TRANSFER,
		MECHANISM_IDS.PARCEL_TRANSFER_PLAYER,
		MECHANISM_IDS.PLAYER_TRADE_TRANSFER,
	];

	// Acoes administrativas existem no estoque real e no painel forense da staff,
	// mas NAO entram nos KPIs oficiais de gameplay (entrou no bolso, saiu do jogo,
	// fluxo do jogo, series e breakdowns principais).
	const NON_GAMEPLAY_MECHANISM_IDS = [
		MECHANISM_IDS.ADMIN_COMMAND_GOLD_GRANT,
		MECHANISM_IDS.ADMIN_CREATED_GOLD_HANDOFF,
	];

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

	const buildDayBucketSelect = (columnExpression, alias, timeStorageMode) => {
		if (timeStorageMode === TIME_STORAGE_MODE.EPOCH) {
			return connection.raw(`(${columnExpression} - MOD(${columnExpression}, ?)) AS ${alias}`, [DAY_IN_MS]);
		}

		return connection.raw(`DATE_FORMAT(${columnExpression}, '%Y-%m-%d') AS ${alias}`);
	};

	const buildDayBucketGroupExpression = (columnExpression, timeStorageMode) => (
		timeStorageMode === TIME_STORAGE_MODE.EPOCH
			? `(${columnExpression} - MOD(${columnExpression}, ${DAY_IN_MS}))`
			: `DATE_FORMAT(${columnExpression}, '%Y-%m-%d')`
	);

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

	const buildVocationCaseExpression = () => (`CASE players.vocation ${vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ')} ELSE 'Unknown' END`);
	const clampText = (value, maxLength = 255) => String(value || '').trim().slice(0, maxLength);
	let ensuredFinancialLockTables = false;
	let ensuredPunishmentTable = false;

	const ensureFinancialLockTables = async () => {
		if (ensuredFinancialLockTables) {
			return;
		}

		await connection.raw(
			"CREATE TABLE IF NOT EXISTS `gold_player_financial_lock_state` (" +
			"`player_id` INT UNSIGNED NOT NULL," +
			"`is_locked` TINYINT(1) NOT NULL DEFAULT 0," +
			"`reason` VARCHAR(255) NOT NULL DEFAULT ''," +
			"`locked_by_player_id` INT UNSIGNED NULL," +
			"`locked_by_name_snapshot` VARCHAR(64) NOT NULL DEFAULT ''," +
			"`updated_at` BIGINT UNSIGNED NOT NULL DEFAULT 0," +
			"PRIMARY KEY (`player_id`)," +
			"KEY `gold_player_financial_lock_state_locked_idx` (`is_locked`, `updated_at`)" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8mb3"
		);

		await connection.raw(
			"CREATE TABLE IF NOT EXISTS `gold_player_financial_lock_command` (" +
			"`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT," +
			"`player_id` INT UNSIGNED NOT NULL," +
			"`requested_state` TINYINT(1) NOT NULL DEFAULT 0," +
			"`reason` VARCHAR(255) NOT NULL DEFAULT ''," +
			"`requested_by_player_id` INT UNSIGNED NULL," +
			"`requested_by_name_snapshot` VARCHAR(64) NOT NULL DEFAULT ''," +
			"`requested_at` BIGINT UNSIGNED NOT NULL DEFAULT 0," +
			"`processed_at` BIGINT UNSIGNED NULL," +
			"`status` VARCHAR(24) NOT NULL DEFAULT 'PENDING'," +
			"`status_message` VARCHAR(255) NOT NULL DEFAULT ''," +
			"PRIMARY KEY (`id`)," +
			"KEY `gold_player_financial_lock_command_status_idx` (`status`, `requested_at`)," +
			"KEY `gold_player_financial_lock_command_player_idx` (`player_id`, `requested_at`)" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8mb3"
		);

		ensuredFinancialLockTables = true;
	};

	const ensurePunishmentTable = async () => {
		if (ensuredPunishmentTable) {
			return;
		}

		await connection.raw(
			"CREATE TABLE IF NOT EXISTS `punishment` (" +
			"`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT," +
			"`player_id` INT UNSIGNED NOT NULL," +
			"`account_id` INT UNSIGNED NULL," +
			"`punishment_type` VARCHAR(32) NOT NULL DEFAULT 'STAFF_NOTE'," +
			"`severity` VARCHAR(24) NOT NULL DEFAULT 'INFO'," +
			"`status` VARCHAR(24) NOT NULL DEFAULT 'RECORDED'," +
			"`reason` VARCHAR(255) NOT NULL DEFAULT ''," +
			"`notes` VARCHAR(255) NOT NULL DEFAULT ''," +
			"`source_table` VARCHAR(64) NOT NULL DEFAULT ''," +
			"`source_ref_id` BIGINT UNSIGNED NULL," +
			"`source_fingerprint` VARCHAR(191) NOT NULL DEFAULT ''," +
			"`recorded_at` BIGINT UNSIGNED NOT NULL DEFAULT 0," +
			"`starts_at` BIGINT UNSIGNED NULL," +
			"`expires_at` BIGINT UNSIGNED NULL," +
			"`created_by_player_id` INT UNSIGNED NULL," +
			"`created_by_name_snapshot` VARCHAR(64) NOT NULL DEFAULT ''," +
			"`updated_at` BIGINT UNSIGNED NOT NULL DEFAULT 0," +
			"PRIMARY KEY (`id`)," +
			"UNIQUE KEY `punishment_source_fingerprint_uidx` (`source_fingerprint`)," +
			"KEY `punishment_player_recorded_idx` (`player_id`, `recorded_at`)," +
			"KEY `punishment_account_recorded_idx` (`account_id`, `recorded_at`)," +
			"KEY `punishment_source_idx` (`source_table`, `source_ref_id`)" +
			") ENGINE=InnoDB DEFAULT CHARSET=utf8mb3"
		);

		const hasLegacyCriminalRecordTable = await connection.schema.hasTable('player_criminal_record');
		if (hasLegacyCriminalRecordTable) {
			await connection.raw(
				"INSERT INTO `punishment` (" +
				"`player_id`, `account_id`, `punishment_type`, `severity`, `status`, `reason`, `notes`, `source_table`, `source_ref_id`, `source_fingerprint`, `recorded_at`, `starts_at`, `expires_at`, `created_by_player_id`, `created_by_name_snapshot`, `updated_at`" +
				") " +
				"SELECT " +
				"`player_id`, `account_id`, `event_type`, `severity`, `status`, `reason`, `notes`, `source_table`, `source_ref_id`, " +
				"LEFT(CASE " +
				"WHEN COALESCE(`source_table`, '') <> '' AND `source_ref_id` IS NOT NULL THEN CONCAT(`source_table`, ':', `source_ref_id`) " +
				"ELSE CONCAT('player_criminal_record:', `id`) END, 191) AS `source_fingerprint`, " +
				"`recorded_at`, `recorded_at`, `expires_at`, `recorded_by_player_id`, `recorded_by_name_snapshot`, `recorded_at` " +
				"FROM `player_criminal_record` " +
				"ON DUPLICATE KEY UPDATE " +
				"`player_id` = VALUES(`player_id`), `account_id` = VALUES(`account_id`), `punishment_type` = VALUES(`punishment_type`), `severity` = VALUES(`severity`), `status` = VALUES(`status`), `reason` = VALUES(`reason`), `notes` = VALUES(`notes`), `source_table` = VALUES(`source_table`), `source_ref_id` = VALUES(`source_ref_id`), `recorded_at` = VALUES(`recorded_at`), `starts_at` = VALUES(`starts_at`), `expires_at` = VALUES(`expires_at`), `created_by_player_id` = VALUES(`created_by_player_id`), `created_by_name_snapshot` = VALUES(`created_by_name_snapshot`), `updated_at` = VALUES(`updated_at`)"
			);
		}

		ensuredPunishmentTable = true;
	};

	const buildPunishmentSourceFingerprint = (prefix, parts = []) => {
		const normalizedPrefix = clampText(prefix || 'punishment', 96) || 'punishment';
		const normalizedParts = Array.isArray(parts)
			? parts
				.filter((part) => part !== undefined && part !== null && String(part).trim() !== '')
				.map((part) => clampText(part, 80))
				.filter(Boolean)
			: [];

		return clampText([normalizedPrefix, ...normalizedParts].join(':'), PUNISHMENT_SOURCE_FINGERPRINT_MAX_LENGTH) || normalizedPrefix;
	};

	const buildAccountBanPunishmentFingerprint = (row) => buildPunishmentSourceFingerprint('account_ban', [
		toSafeNumber(row.accountId),
		toSafeTimestamp(row.bannedAt),
		toSafeTimestamp(row.expiresAt || row.expiredAt),
		toSafeNumber(row.bannedByPlayerId),
		clampText(row.reason, 64),
	]);

	const buildNameLockPunishmentFingerprint = (row) => buildPunishmentSourceFingerprint('player_namelocks', [
		toSafeNumber(row.playerId),
		toSafeTimestamp(row.namelockedAt),
		toSafeNumber(row.namelockedByPlayerId),
		clampText(row.reason, 64),
	]);

	const upsertPunishmentEntry = async (trx, entry) => {
		const normalizedRecordedAt = toSafeTimestamp(entry.recordedAt) || Date.now();
		const normalizedPlayerId = Math.max(1, toSafeNumber(entry.playerId));
		if (!normalizedPlayerId) {
			return;
		}

		const fallbackFingerprint = buildPunishmentSourceFingerprint(entry.sourceTable || 'punishment', [
			normalizedPlayerId,
			normalizedRecordedAt,
			clampText(entry.punishmentType || 'STAFF_NOTE', 32).toUpperCase(),
		]);

		const normalized = {
			player_id: normalizedPlayerId,
			account_id: entry.accountId ? toSafeNumber(entry.accountId) : null,
			punishment_type: clampText(entry.punishmentType || 'STAFF_NOTE', 32).toUpperCase(),
			severity: clampText(entry.severity || 'INFO', 24).toUpperCase(),
			status: clampText(entry.status || 'RECORDED', 24).toUpperCase(),
			reason: clampText(entry.reason, 255),
			notes: clampText(entry.notes, 255),
			source_table: clampText(entry.sourceTable, 64),
			source_ref_id: entry.sourceRefId === undefined || entry.sourceRefId === null ? null : toSafeNumber(entry.sourceRefId),
			source_fingerprint: clampText(entry.sourceFingerprint || fallbackFingerprint, PUNISHMENT_SOURCE_FINGERPRINT_MAX_LENGTH),
			recorded_at: normalizedRecordedAt,
			starts_at: entry.startsAt === undefined || entry.startsAt === null ? null : toSafeTimestamp(entry.startsAt),
			expires_at: entry.expiresAt === undefined || entry.expiresAt === null ? null : toSafeTimestamp(entry.expiresAt),
			created_by_player_id: entry.createdByPlayerId ? toSafeNumber(entry.createdByPlayerId) : null,
			created_by_name_snapshot: clampText(entry.createdByNameSnapshot, 64),
			updated_at: entry.updatedAt === undefined || entry.updatedAt === null ? normalizedRecordedAt : toSafeTimestamp(entry.updatedAt),
		};

		await trx('punishment')
			.insert(normalized)
			.onConflict('source_fingerprint')
			.merge({
				player_id: normalized.player_id,
				account_id: normalized.account_id,
				punishment_type: normalized.punishment_type,
				severity: normalized.severity,
				status: normalized.status,
				reason: normalized.reason,
				notes: normalized.notes,
				source_table: normalized.source_table,
				source_ref_id: normalized.source_ref_id,
				recorded_at: normalized.recorded_at,
				starts_at: normalized.starts_at,
				expires_at: normalized.expires_at,
				created_by_player_id: normalized.created_by_player_id,
				created_by_name_snapshot: normalized.created_by_name_snapshot,
				updated_at: normalized.updated_at,
			});
	};

	const buildPunishmentEntryFromLockCommandRow = (row, accountId) => ({
		playerId: toSafeNumber(row.playerId),
		accountId: accountId ? toSafeNumber(accountId) : null,
		punishmentType: toSafeNumber(row.requestedState) ? 'FINANCIAL_LOCK' : 'FINANCIAL_UNLOCK',
		severity: toSafeNumber(row.requestedState) ? 'HIGH' : 'INFO',
		status: row.status || 'PENDING',
		reason: row.reason || (toSafeNumber(row.requestedState)
			? 'Investigacao financeira via painel admin.'
			: 'Desbloqueio financeiro via painel admin.'),
		notes: row.statusMessage || '',
		sourceTable: 'gold_player_financial_lock_command',
		sourceRefId: toSafeNumber(row.id),
		sourceFingerprint: buildPunishmentSourceFingerprint('gold_player_financial_lock_command', [toSafeNumber(row.id)]),
		recordedAt: row.requestedAt,
		startsAt: row.requestedAt,
		expiresAt: null,
		createdByPlayerId: row.requestedByPlayerId,
		createdByNameSnapshot: row.requestedByNameSnapshot,
		updatedAt: row.processedAt || row.requestedAt,
	});

	const buildPunishmentEntryFromBanRow = (row, playerId, status) => ({
		playerId,
		accountId: row.accountId ? toSafeNumber(row.accountId) : null,
		punishmentType: 'ACCOUNT_BAN',
		severity: 'CRITICAL',
		status,
		reason: row.reason || '',
		notes: '',
		sourceTable: status === 'ACTIVE' ? 'account_bans' : 'account_ban_history',
		sourceRefId: row.id === undefined || row.id === null ? null : toSafeNumber(row.id),
		sourceFingerprint: buildAccountBanPunishmentFingerprint(row),
		recordedAt: row.bannedAt,
		startsAt: row.bannedAt,
		expiresAt: row.expiresAt || row.expiredAt || null,
		createdByPlayerId: row.bannedByPlayerId,
		createdByNameSnapshot: row.bannedByName,
		updatedAt: row.expiredAt || row.expiresAt || row.bannedAt,
	});

	const buildPunishmentEntryFromNameLockRow = (row, accountId) => ({
		playerId: toSafeNumber(row.playerId),
		accountId: accountId ? toSafeNumber(accountId) : null,
		punishmentType: 'NAMELOCK',
		severity: 'MEDIUM',
		status: 'ACTIVE',
		reason: row.reason || '',
		notes: '',
		sourceTable: 'player_namelocks',
		sourceRefId: null,
		sourceFingerprint: buildNameLockPunishmentFingerprint(row),
		recordedAt: row.namelockedAt,
		startsAt: row.namelockedAt,
		expiresAt: null,
		createdByPlayerId: row.namelockedByPlayerId,
		createdByNameSnapshot: row.namelockedByName,
		updatedAt: row.namelockedAt,
	});

	const syncPunishmentsForPlayer = async ({ playerId, accountId } = {}) => {
		const safePlayerId = Math.max(1, toSafeNumber(playerId));
		if (!safePlayerId) {
			return;
		}

		await ensurePunishmentTable();

		const safeAccountId = accountId ? toSafeNumber(accountId) : 0;
		const [lockCommandRows, activeBanRows, banHistoryRows, nameLockRows] = await Promise.all([
			connection('gold_player_financial_lock_command')
				.select(
					'id',
					'player_id as playerId',
					'requested_state as requestedState',
					'reason',
					'requested_by_player_id as requestedByPlayerId',
					'requested_by_name_snapshot as requestedByNameSnapshot',
					'requested_at as requestedAt',
					'processed_at as processedAt',
					'status',
					'status_message as statusMessage'
				)
				.where('player_id', safePlayerId)
				.orderBy('id', 'asc'),
			safeAccountId
				? connection('account_bans as ban')
					.leftJoin('players as bannedBy', 'bannedBy.id', 'ban.banned_by')
					.select(
						'ban.account_id as accountId',
						'ban.reason',
						'ban.banned_at as bannedAt',
						'ban.expires_at as expiresAt',
						'ban.banned_by as bannedByPlayerId',
						'bannedBy.name as bannedByName'
					)
					.where('ban.account_id', safeAccountId)
				: Promise.resolve([]),
			safeAccountId
				? connection('account_ban_history as banHistory')
					.leftJoin('players as bannedBy', 'bannedBy.id', 'banHistory.banned_by')
					.select(
						'banHistory.id',
						'banHistory.account_id as accountId',
						'banHistory.reason',
						'banHistory.banned_at as bannedAt',
						'banHistory.expired_at as expiredAt',
						'banHistory.banned_by as bannedByPlayerId',
						'bannedBy.name as bannedByName'
					)
					.where('banHistory.account_id', safeAccountId)
					.orderBy('banHistory.banned_at', 'asc')
				: Promise.resolve([]),
			connection('player_namelocks as nameLock')
				.leftJoin('players as staff', 'staff.id', 'nameLock.namelocked_by')
				.select(
					'nameLock.player_id as playerId',
					'nameLock.reason',
					'nameLock.namelocked_at as namelockedAt',
					'nameLock.namelocked_by as namelockedByPlayerId',
					'staff.name as namelockedByName'
				)
				.where('nameLock.player_id', safePlayerId)
				.orderBy('nameLock.namelocked_at', 'asc'),
		]);

		const punishmentEntries = [
			...lockCommandRows.map((row) => buildPunishmentEntryFromLockCommandRow(row, safeAccountId || null)),
			...activeBanRows.map((row) => buildPunishmentEntryFromBanRow(row, safePlayerId, 'ACTIVE')),
			...banHistoryRows.map((row) => buildPunishmentEntryFromBanRow(row, safePlayerId, 'EXPIRED')),
			...nameLockRows.map((row) => buildPunishmentEntryFromNameLockRow(row, safeAccountId || null)),
		];

		if (!punishmentEntries.length) {
			return;
		}

		await connection.transaction(async (trx) => {
			for (const punishmentEntry of punishmentEntries) {
				await upsertPunishmentEntry(trx, punishmentEntry);
			}
		});
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

	const applyMechanismExclusion = (query, column, mechanismIds = []) => {
		if (!Array.isArray(mechanismIds) || mechanismIds.length === 0) {
			return query;
		}

		return query.whereNotIn(column, mechanismIds);
	};

	const getSummaryByClass = async (tableName, bucketColumn, from, to, timeStorageMode, excludedMechanismIds = []) => {
		const rows = await applyMechanismExclusion(
			cloneWithRange(tableName, bucketColumn, from, to, timeStorageMode),
			'mechanism_id',
			excludedMechanismIds,
		)
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

	const getRealPlayerTransferSummary = async (tableName, bucketColumn, from, to, timeStorageMode) => {
		const row = await cloneWithRange(tableName, bucketColumn, from, to, timeStorageMode)
			.whereIn('mechanism_id', REAL_PLAYER_TRANSFER_MECHANISM_IDS)
			.sum({ totalAmount: 'total_amount' })
			.sum({ eventCount: 'event_count' })
			.first();

		return {
			totalAmount: toSafeNumber(row?.totalAmount),
			eventCount: toSafeNumber(row?.eventCount),
		};
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

			const summaryPromise = getSummaryByClass(
				rollupTarget.tableName,
				rollupTarget.bucketColumn,
				from,
				to,
				timeStorageMode,
				NON_GAMEPLAY_MECHANISM_IDS,
			);
			const realTransferSummaryPromise = getRealPlayerTransferSummary(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode);

			const seriesPromise = applyMechanismExclusion(
				cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode),
				'mechanism_id',
				NON_GAMEPLAY_MECHANISM_IDS,
			)
				.select(buildRollupBucketSelect(rollupTarget.bucketColumn, rollupTarget.granularity, timeStorageMode))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS faucetAmount', [CLASS_IDS.FAUCET]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS sinkAmount', [CLASS_IDS.SINK]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN total_amount ELSE 0 END) AS transferAmount', [CLASS_IDS.TRANSFER]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN event_count ELSE 0 END) AS faucetEvents', [CLASS_IDS.FAUCET]))
				.select(connection.raw('SUM(CASE WHEN class_id = ? THEN event_count ELSE 0 END) AS sinkEvents', [CLASS_IDS.SINK]))
				.groupBy(rollupTarget.bucketColumn)
				.orderBy(rollupTarget.bucketColumn, 'asc');

			const mechanismRowsPromise = applyMechanismExclusion(
				cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode, 'rollup'),
				'rollup.mechanism_id',
				NON_GAMEPLAY_MECHANISM_IDS,
			)
				.join('gold_mechanism_dim as mechanism', 'mechanism.id', 'rollup.mechanism_id')
				.select('rollup.class_id as classId', 'mechanism.id as mechanismId', 'mechanism.name as mechanismName')
				.sum({ totalAmount: 'rollup.total_amount' })
				.sum({ eventCount: 'rollup.event_count' })
				.groupBy('rollup.class_id', 'mechanism.id', 'mechanism.name');

			const originRowsPromise = applyMechanismExclusion(
				cloneWithRange(rollupTarget.tableName, rollupTarget.bucketColumn, from, to, timeStorageMode, 'rollup'),
				'rollup.mechanism_id',
				NON_GAMEPLAY_MECHANISM_IDS,
			)
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
					'change_direction as changeDirection',
					'mechanism_name as mechanismName',
					'actor_player_id as actorPlayerId',
					'actor_player_name as actorPlayerName',
					'subject_player_id as subjectPlayerId',
					'subject_player_name as subjectPlayerName',
					'amount',
					'inventory_delta as inventoryDelta',
					'bank_delta as bankDelta',
					'net_delta as netDelta',
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
				realTransferSummary,
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
				realTransferSummaryPromise,
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
						transferredGold: realTransferSummary.totalAmount,
						transferredEvents: realTransferSummary.eventCount,
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
							changeDirection: row.changeDirection,
							mechanismName: row.mechanismName,
							actorPlayerId: row.actorPlayerId ? toSafeNumber(row.actorPlayerId) : null,
							actorPlayerName: row.actorPlayerName,
							subjectPlayerId: row.subjectPlayerId ? toSafeNumber(row.subjectPlayerId) : null,
							subjectPlayerName: row.subjectPlayerName,
							amount: toSafeNumber(row.amount),
							inventoryDelta: toSafeNumber(row.inventoryDelta),
							bankDelta: toSafeNumber(row.bankDelta),
							netDelta: row.netDelta === null ? null : toSafeNumber(row.netDelta),
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
					'change_direction as changeDirection',
					'mechanism_name as mechanismName',
					'actor_player_id as actorPlayerId',
					'actor_player_name as actorPlayerName',
					'subject_player_id as subjectPlayerId',
					'subject_player_name as subjectPlayerName',
					'amount',
					'inventory_delta as inventoryDelta',
					'bank_delta as bankDelta',
					'net_delta as netDelta',
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
						changeDirection: row.changeDirection,
						mechanismName: row.mechanismName,
						actorPlayerId: row.actorPlayerId ? toSafeNumber(row.actorPlayerId) : null,
						actorPlayerName: row.actorPlayerName,
						subjectPlayerId: row.subjectPlayerId ? toSafeNumber(row.subjectPlayerId) : null,
						subjectPlayerName: row.subjectPlayerName,
						amount: toSafeNumber(row.amount),
						inventoryDelta: toSafeNumber(row.inventoryDelta),
						bankDelta: toSafeNumber(row.bankDelta),
						netDelta: row.netDelta === null ? null : toSafeNumber(row.netDelta),
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

	// Phase 5: per-player drill-down now comes from the same official server stock snapshot
	// that feeds the stock cards. This keeps the modal ranking aligned with the card totals.
	const PAGE_SIZE = 15;
	const STOCK_BREAKDOWN_COLUMN_BY_COMPARTMENT = {
		bank: 'bank_gold',
		inventory: 'inventory_gold',
		depot: 'depot_gold',
		houses: 'house_gold',
	};

	const buildPagination = (page, pageSize = PAGE_SIZE) => {
		const safePage = Math.max(1, Number(page) || 1);
		const safePageSize = Math.max(1, Number(pageSize) || PAGE_SIZE);
		return { offset: (safePage - 1) * safePageSize, limit: safePageSize, page: safePage, pageSize: safePageSize };
	};

	const wrapList = (rows, totalCount, page, pageSize = PAGE_SIZE) => ({
		page,
		pageSize,
		totalCount,
		totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
		rows,
	});

	const buildPlayerHistoryDirection = (row, playerId) => {
		const mechanismName = row?.mechanismName || '';
		if (mechanismName === 'BANK_DEPOSIT' || mechanismName === 'BANK_WITHDRAW') {
			return 'INTERNAL';
		}

		if (row?.recordSource === 'DB_TRIGGER') {
			return row?.changeDirection || 'NEUTRAL';
		}

		const actorPlayerId = toSafeNumber(row?.actorPlayerId);
		const beneficiaryPlayerId = toSafeNumber(row?.beneficiaryPlayerId);
		const counterpartyPlayerId = toSafeNumber(row?.counterpartyPlayerId);
		const classId = toSafeNumber(row?.classId);

		if (classId === CLASS_IDS.TRANSFER) {
			if (playerId === actorPlayerId && playerId !== beneficiaryPlayerId && playerId !== counterpartyPlayerId) {
				return 'DEBIT';
			}

			if ((playerId === beneficiaryPlayerId || playerId === counterpartyPlayerId) && playerId !== actorPlayerId) {
				return 'CREDIT';
			}

			return 'TRANSFER';
		}

		if (classId === CLASS_IDS.FAUCET) {
			return 'CREDIT';
		}

		if (classId === CLASS_IDS.SINK) {
			return 'DEBIT';
		}

		return 'NEUTRAL';
	};

	const resolvePlayerHistoryCounterparty = (row, playerId) => {
		const candidates = [
			{ id: toSafeNumber(row?.actorPlayerId), name: row?.actorPlayerName || null },
			{ id: toSafeNumber(row?.beneficiaryPlayerId), name: row?.beneficiaryPlayerName || null },
			{ id: toSafeNumber(row?.counterpartyPlayerId), name: row?.counterpartyPlayerName || null },
		];

		const seen = new Set();
		for (const candidate of candidates) {
			if (!candidate.id || candidate.id === playerId || seen.has(candidate.id)) {
				continue;
			}

			seen.add(candidate.id);
			return candidate;
		}

		return null;
	};

	const buildPlayerFinancialHistoryHeadline = (row, direction) => {
		switch (row?.mechanismName) {
			case 'MONSTER_GOLD_CLAIM':
				return 'Loot de gold de criatura';
			case 'MONSTER_GOLD_DECAY_UNCLAIMED':
				return 'Gold perdido sem coleta';
			case 'NPC_ITEM_SALE':
				return 'Venda de item para NPC';
			case 'QUEST_DIRECT_REWARD':
				return 'Recompensa de quest';
			case 'TASK_DIRECT_REWARD':
				return 'Recompensa de task';
			case 'GAMBLING_PAYOUT':
				return 'Prêmio de aposta';
			case 'NPC_ITEM_PURCHASE':
				return 'Compra de item em NPC';
			case 'NPC_TRAVEL_FEE':
				return 'Pagamento de viagem';
			case 'NPC_SPELL_PURCHASE':
				return 'Compra de magia';
			case 'NPC_BLESSING_PURCHASE':
				return 'Compra de blessing';
			case 'NPC_PROMOTION_PURCHASE':
				return 'Compra de promotion';
			case 'NPC_SERVICE_FEE':
				return 'Serviço pago a NPC';
			case 'HOUSE_WORLD_PURCHASE':
				return 'Compra de casa do mapa';
			case 'HOUSE_RENT':
				return 'Aluguel de casa';
			case 'HOUSE_TRADE_TRANSFER':
				return direction === 'CREDIT' ? 'Recebido por venda de casa' : direction === 'DEBIT' ? 'Pago por compra de casa' : 'Venda de casa entre jogadores';
			case 'HOUSE_TRADE_TAX':
				return 'Taxa de venda de casa';
			case 'BANK_DEPOSIT':
				return 'Depósito no banco';
			case 'BANK_WITHDRAW':
				return 'Saque do banco';
			case 'BANK_TRANSFER_PLAYER':
				return direction === 'CREDIT' ? 'Recebido por transferência bancária' : 'Transferência bancária enviada';
			case 'PARCEL_TRANSFER_PLAYER':
				return direction === 'CREDIT' ? 'Recebido por parcel' : 'Transferência via parcel';
			case 'PLAYER_TRADE_TRANSFER':
				return direction === 'CREDIT' ? 'Recebido em trade com jogador' : 'Trade com jogador';
			case 'LOW_LEVEL_UNCLASSIFIED_ADD':
				return 'Entrada monetária não classificada';
			case 'LOW_LEVEL_UNCLASSIFIED_REMOVE':
				return 'Saída monetária não classificada';
			case 'SERVER_TAX_OTHER':
				return 'Taxa adicional do servidor';
			case 'ADMIN_COMMAND_GOLD_GRANT':
				return 'Ajuste manual da staff';
			case 'ADMIN_CREATED_GOLD_HANDOFF':
				return direction === 'CREDIT' ? 'Repasse manual recebido da staff' : 'Repasse manual de gold criado pela staff';
			case 'DATABASE_EXTERNAL_BALANCE_CHANGE':
				return 'Mudança externa de saldo';
			default:
				return row?.mechanismName || 'Evento monetário';
		}
	};

	const normalizePlayerFinancialHistoryViewMode = (value) => (
		String(value || '').trim().toLowerCase() === PLAYER_FINANCIAL_HISTORY_VIEW_MODE.DETAILED
			? PLAYER_FINANCIAL_HISTORY_VIEW_MODE.DETAILED
			: PLAYER_FINANCIAL_HISTORY_VIEW_MODE.GROUPED
	);

	const buildPlayerFinancialHistoryContext = (row, playerId) => {
		const parts = [];
		const counterparty = resolvePlayerHistoryCounterparty(row, playerId);

		if (row?.sourceNameSnapshot) {
			parts.push(row.sourceNameSnapshot);
		}

		if (toSafeNumber(row?.houseId)) {
			parts.push(`casa #${toSafeNumber(row.houseId)}`);
		}

		if (counterparty?.name) {
			parts.push(`contraparte: ${counterparty.name}`);
		}

		if (row?.recordSource === 'DB_TRIGGER' && row?.balanceBefore !== null && row?.balanceAfter !== null) {
			parts.push(`saldo ${toSafeNumber(row.balanceBefore).toLocaleString('pt-BR')} -> ${toSafeNumber(row.balanceAfter).toLocaleString('pt-BR')}`);
		}

		return parts.join(' · ');
	};

	const normalizePlayerFinancialHistoryFactRow = (row, playerId) => {
		const direction = buildPlayerHistoryDirection(row, playerId);
		const counterparty = resolvePlayerHistoryCounterparty(row, playerId);

		return {
			eventId: `fact-${toSafeNumber(row.bootId)}-${toSafeNumber(row.eventSeq)}`,
			recordSource: 'AUDIT_FACT',
			occurredAt: toSafeTimestamp(row.occurredAt),
			mechanismName: row.mechanismName || 'UNKNOWN',
			originName: row.originName || null,
			direction,
			headline: buildPlayerFinancialHistoryHeadline(row, direction),
			context: buildPlayerFinancialHistoryContext(row, playerId),
			amount: toSafeNumber(row.amount),
			counterpartyName: counterparty?.name || null,
			sourceRefId: row.sourceRefId === null || row.sourceRefId === undefined ? null : toSafeNumber(row.sourceRefId),
			sourceNameSnapshot: row.sourceNameSnapshot || null,
			houseId: row.houseId ? toSafeNumber(row.houseId) : null,
			groupedDay: null,
			lootEventCount: null,
			isConsolidated: false,
		};
	};

	const normalizePlayerFinancialHistoryGroupedMonsterLootRow = (row) => ({
		eventId: `grouped-monster-loot-${toSafeTimestamp(row.groupedDay)}-${String(row.sourceNameSnapshot || 'criatura-desconhecida').toLowerCase()}`,
		recordSource: 'AUDIT_FACT',
		occurredAt: toSafeTimestamp(row.occurredAt),
		mechanismName: 'MONSTER_GOLD_CLAIM',
		originName: null,
		direction: 'CREDIT',
		headline: buildPlayerFinancialHistoryHeadline({ mechanismName: 'MONSTER_GOLD_CLAIM' }, 'CREDIT'),
		context: row.sourceNameSnapshot || 'criatura desconhecida',
		amount: toSafeNumber(row.amount),
		counterpartyName: null,
		sourceRefId: null,
		sourceNameSnapshot: row.sourceNameSnapshot || null,
		houseId: null,
		groupedDay: toSafeTimestamp(row.groupedDay),
		lootEventCount: Math.max(1, toSafeNumber(row.lootEventCount)),
		isConsolidated: true,
	});

	const normalizePlayerFinancialHistoryInterventionRow = (row) => ({
		eventId: `db-${toSafeNumber(row.sourceRowId)}-${toSafeTimestamp(row.occurredAt)}`,
		recordSource: row.recordSource || 'DB_TRIGGER',
		occurredAt: toSafeTimestamp(row.occurredAt),
		mechanismName: row.mechanismName || 'DATABASE_EXTERNAL_BALANCE_CHANGE',
		originName: null,
		direction: row.changeDirection || 'NEUTRAL',
		headline: buildPlayerFinancialHistoryHeadline(row, row.changeDirection || 'NEUTRAL'),
		context: buildPlayerFinancialHistoryContext(row, 0),
		amount: toSafeNumber(row.amount),
		counterpartyName: null,
		sourceRefId: null,
		sourceNameSnapshot: row.sourceNameSnapshot || null,
		houseId: null,
		groupedDay: null,
		lootEventCount: null,
		isConsolidated: false,
	});

	const buildCriminalRecordHeadline = (eventType, status = '') => {
		switch (eventType) {
			case 'FINANCIAL_LOCK':
				return 'Lock financeiro';
			case 'FINANCIAL_UNLOCK':
				return 'Desbloqueio financeiro';
			case 'ACCOUNT_BAN':
				return String(status || '').toUpperCase() === 'ACTIVE'
					? 'Banimento de conta ativo'
					: 'Banimento de conta no histórico';
			case 'ACCOUNT_BAN_ACTIVE':
				return 'Banimento de conta ativo';
			case 'ACCOUNT_BAN_HISTORY':
				return 'Banimento de conta no histórico';
			case 'NAMELOCK':
				return 'Namelock';
			case 'WARNING':
				return 'Advertencia';
			case 'STAFF_NOTE':
				return 'Anotacao da staff';
			default:
				return eventType || 'Registro disciplinar';
		}
	};

	const mapPunishmentRow = (row) => ({
		id: `punishment-${toSafeNumber(row.id)}`,
		eventType: row.punishmentType || 'STAFF_NOTE',
		headline: buildCriminalRecordHeadline(row.punishmentType, row.status),
		reason: row.reason || '',
		notes: row.notes || '',
		severity: row.severity || 'INFO',
		status: row.status || 'RECORDED',
		recordedAt: toSafeTimestamp(row.recordedAt),
		expiresAt: toSafeTimestamp(row.expiresAt),
		recordedByPlayerId: row.createdByPlayerId ? toSafeNumber(row.createdByPlayerId) : null,
		recordedByNameSnapshot: row.createdByNameSnapshot || null,
		sourceTable: row.sourceTable || null,
		sourceRefId: row.sourceRefId === null || row.sourceRefId === undefined ? null : toSafeNumber(row.sourceRefId),
	});

	const getEconomyBreakdownRepository = async (compartment, { page = 1 } = {}) => {
		const pagination = buildPagination(page);

		try {
			const goldColumn = STOCK_BREAKDOWN_COLUMN_BY_COMPARTMENT[compartment];
			if (!goldColumn) {
				return { status: 400, message: `Unsupported compartment: ${compartment}` };
			}

			const stockSnapshot = await getLatestServerGoldStockSnapshot();
			if (!stockSnapshot?.id) {
				return {
					status: 200,
					message: {
						...wrapList([], 0, pagination.page),
						snapshotAt: null,
						triggerName: null,
						source: 'official_stock_snapshot',
					},
				};
			}

			const baseQuery = connection('gold_server_player_stock_snapshot as playerStock')
				.where('playerStock.snapshot_id', stockSnapshot.id)
				.andWhere(`playerStock.${goldColumn}`, '>', 0);

			const [{ total }] = await baseQuery.clone().count({ total: 'playerStock.id' });
			const rows = await baseQuery.clone()
				.select(
					'playerStock.player_id as playerId',
					'playerStock.player_name_snapshot as playerName',
					'playerStock.level',
					'playerStock.is_online as isOnline',
					'playerStock.bank_gold as bankGold',
					'playerStock.inventory_gold as inventoryGold',
					'playerStock.depot_gold as depotGold',
					'playerStock.house_gold as houseGold',
					'playerStock.total_gold as totalGold'
				)
				.select(connection.raw(`playerStock.${goldColumn} as gold`))
				.orderBy(`playerStock.${goldColumn}`, 'desc')
				.orderBy('playerStock.total_gold', 'desc')
				.orderBy('playerStock.player_id', 'asc')
				.limit(pagination.limit)
				.offset(pagination.offset);

			return {
				status: 200,
				message: {
					...wrapList(rows.map((row) => ({
						playerId: Number(row.playerId) || 0,
						playerName: row.playerName,
						level: Number(row.level) || 0,
						isOnline: Boolean(Number(row.isOnline) || 0),
						gold: Number(row.gold) || 0,
						bankGold: Number(row.bankGold) || 0,
						inventoryGold: Number(row.inventoryGold) || 0,
						depotGold: Number(row.depotGold) || 0,
						houseGold: Number(row.houseGold) || 0,
						totalGold: Number(row.totalGold) || 0,
					})), Number(total) || 0, pagination.page),
					snapshotAt: toSafeTimestamp(stockSnapshot.snapshotAt),
					triggerName: stockSnapshot.triggerName,
					source: 'official_stock_snapshot',
				},
			};
		} catch (err) {
			if (['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR'].includes(err?.code)) {
				return {
					status: 200,
					message: {
						...wrapList([], 0, pagination.page),
						snapshotAt: null,
						triggerName: null,
						source: 'official_stock_snapshot',
						unavailable: true,
					},
				};
			}

			console.log('[EconomyRepository] getEconomyBreakdownRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyPlayerProfileRepository = async (playerId) => {
		const safePlayerId = Math.max(1, toSafeNumber(playerId));
		if (!safePlayerId) {
			return { status: 400, message: 'Invalid player id.' };
		}

		try {
			await ensureFinancialLockTables();
			await ensurePunishmentTable();
			const stockSnapshot = await getLatestServerGoldStockSnapshot();

			const [playerRow, stockRow, lastCommandRow] = await Promise.all([
				connection('players')
					.leftJoin('gold_player_financial_lock_state as lockState', 'lockState.player_id', 'players.id')
					.select(
						'players.id as playerId',
						'players.account_id as accountId',
						'players.name as playerName',
						'players.level',
						'players.maglevel as magicLevel',
						'players.skill_fist as skillFist',
						'players.skill_club as skillClub',
						'players.skill_sword as skillSword',
						'players.skill_axe as skillAxe',
						'players.skill_dist as skillDistance',
						'players.skill_shielding as skillShielding',
						'players.skill_fishing as skillFishing',
						'players.skill_harvesting as skillHarvesting',
						'lockState.is_locked as isLocked',
						'lockState.reason as financialLockReason',
						'lockState.locked_by_player_id as lockedByPlayerId',
						'lockState.locked_by_name_snapshot as lockedByNameSnapshot',
						'lockState.updated_at as financialLockUpdatedAt',
					)
					.select(connection.raw(`${buildVocationCaseExpression()} as vocation`))
					.where('players.id', safePlayerId)
					.first(),
				stockSnapshot?.id
					? connection('gold_server_player_stock_snapshot as playerStock')
						.select(
							'playerStock.snapshot_at as snapshotAt',
							'playerStock.is_online as isOnline',
							'playerStock.bank_gold as bankGold',
							'playerStock.inventory_gold as inventoryGold',
							'playerStock.depot_gold as depotGold',
							'playerStock.house_gold as houseGold',
							'playerStock.total_gold as totalGold',
						)
						.where('playerStock.snapshot_id', stockSnapshot.id)
						.andWhere('playerStock.player_id', safePlayerId)
						.first()
					: Promise.resolve(null),
				connection('gold_player_financial_lock_command')
					.select(
						'id',
						'requested_state as requestedState',
						'reason',
						'requested_by_player_id as requestedByPlayerId',
						'requested_by_name_snapshot as requestedByNameSnapshot',
						'requested_at as requestedAt',
						'processed_at as processedAt',
						'status',
						'status_message as statusMessage',
					)
					.where('player_id', safePlayerId)
					.orderBy('id', 'desc')
					.first(),
			]);

			if (!playerRow) {
				return { status: 404, message: 'Player not found.' };
			}

			await syncPunishmentsForPlayer({
				playerId: safePlayerId,
				accountId: playerRow.accountId,
			});

			const punishmentRows = await connection('punishment')
				.select(
					'id',
					'punishment_type as punishmentType',
					'severity',
					'status',
					'reason',
					'notes',
					'source_table as sourceTable',
					'source_ref_id as sourceRefId',
					'recorded_at as recordedAt',
					'starts_at as startsAt',
					'expires_at as expiresAt',
					'created_by_player_id as createdByPlayerId',
					'created_by_name_snapshot as createdByNameSnapshot'
				)
				.where('player_id', safePlayerId)
				.orderBy('recorded_at', 'desc')
				.orderBy('id', 'desc')
				.limit(PUNISHMENT_RECORD_LIMIT);

			const criminalRecordItems = punishmentRows.map(mapPunishmentRow).sort((left, right) => {
				const byTime = toSafeNumber(right.recordedAt) - toSafeNumber(left.recordedAt);
				if (byTime !== 0) {
					return byTime;
				}

				return String(right.id).localeCompare(String(left.id));
			}).slice(0, PUNISHMENT_RECORD_LIMIT);

			const warningCount = criminalRecordItems.reduce((count, item) => {
				const eventType = String(item?.eventType || '').toUpperCase();
				const severity = String(item?.severity || '').toUpperCase();
				return count + ((eventType.includes('WARNING') || severity === 'WARNING') ? 1 : 0);
			}, 0);

			return {
				status: 200,
				message: {
					playerId: safePlayerId,
					playerName: playerRow.playerName,
					level: toSafeNumber(playerRow.level),
					vocation: playerRow.vocation,
					skills: {
						magicLevel: toSafeNumber(playerRow.magicLevel),
						fist: toSafeNumber(playerRow.skillFist),
						club: toSafeNumber(playerRow.skillClub),
						sword: toSafeNumber(playerRow.skillSword),
						axe: toSafeNumber(playerRow.skillAxe),
						distance: toSafeNumber(playerRow.skillDistance),
						shielding: toSafeNumber(playerRow.skillShielding),
						fishing: toSafeNumber(playerRow.skillFishing),
						harvesting: toSafeNumber(playerRow.skillHarvesting),
					},
					stock: {
						snapshotAt: stockRow ? toSafeTimestamp(stockRow.snapshotAt) : (stockSnapshot ? toSafeTimestamp(stockSnapshot.snapshotAt) : null),
						triggerName: stockSnapshot?.triggerName || null,
						isOnline: Boolean(toSafeNumber(stockRow?.isOnline)),
						bankGold: toSafeNumber(stockRow?.bankGold),
						inventoryGold: toSafeNumber(stockRow?.inventoryGold),
						depotGold: toSafeNumber(stockRow?.depotGold),
						houseGold: toSafeNumber(stockRow?.houseGold),
						totalGold: toSafeNumber(stockRow?.totalGold),
					},
					financialLock: {
						isLocked: Boolean(toSafeNumber(playerRow.isLocked)),
						reason: playerRow.financialLockReason || '',
						updatedAt: toSafeTimestamp(playerRow.financialLockUpdatedAt),
						lockedByPlayerId: playerRow.lockedByPlayerId ? toSafeNumber(playerRow.lockedByPlayerId) : null,
						lockedByNameSnapshot: playerRow.lockedByNameSnapshot || null,
						lastCommand: lastCommandRow ? {
							id: toSafeNumber(lastCommandRow.id),
							requestedState: Boolean(toSafeNumber(lastCommandRow.requestedState)),
							reason: lastCommandRow.reason || '',
							requestedByPlayerId: lastCommandRow.requestedByPlayerId ? toSafeNumber(lastCommandRow.requestedByPlayerId) : null,
							requestedByNameSnapshot: lastCommandRow.requestedByNameSnapshot || null,
							requestedAt: toSafeTimestamp(lastCommandRow.requestedAt),
							processedAt: toSafeTimestamp(lastCommandRow.processedAt),
							status: lastCommandRow.status || null,
							statusMessage: lastCommandRow.statusMessage || '',
						} : null,
					},
					criminalRecord: {
						warningCount,
						items: criminalRecordItems,
					},
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyPlayerProfileRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyLockedPlayersRepository = async ({ page = 1, search = '' } = {}) => {
		const pagination = buildPagination(page);

		try {
			await ensureFinancialLockTables();
			const normalizedSearch = clampText(search, 64);

			const latestStockSnapshot = await getLatestServerGoldStockSnapshot();
			let baseQuery = connection('gold_player_financial_lock_state as lockState')
				.innerJoin('players', 'players.id', 'lockState.player_id')
				.where('lockState.is_locked', 1);

			if (normalizedSearch) {
				baseQuery = baseQuery.andWhere('players.name', 'like', `%${normalizedSearch}%`);
			}

			if (latestStockSnapshot?.id) {
				baseQuery = baseQuery.leftJoin('gold_server_player_stock_snapshot as playerStock', function joinPlayerStock() {
					this.on('playerStock.player_id', '=', 'players.id')
						.andOn('playerStock.snapshot_id', '=', connection.raw('?', [latestStockSnapshot.id]));
				});
			}

			const onlineSelect = latestStockSnapshot?.id
				? 'playerStock.is_online as isOnline'
				: connection.raw('0 as isOnline');
			const totalGoldSelect = latestStockSnapshot?.id
				? 'playerStock.total_gold as totalGold'
				: connection.raw('0 as totalGold');

			const [{ total }] = await baseQuery.clone().count({ total: 'lockState.player_id' });
			const rows = await baseQuery.clone()
				.select(
					'players.id as playerId',
					'players.name as playerName',
					'players.level',
					'lockState.reason',
					'lockState.locked_by_player_id as lockedByPlayerId',
					'lockState.locked_by_name_snapshot as lockedByNameSnapshot',
					'lockState.updated_at as updatedAt',
					onlineSelect,
					totalGoldSelect
				)
				.select(connection.raw(`(${connection('gold_player_financial_lock_command as cmd')
					.select('cmd.status')
					.whereRaw('cmd.player_id = players.id')
					.orderBy('cmd.id', 'desc')
					.limit(1)
					.toString()}) as lastCommandStatus`))
				.select(connection.raw(`(${connection('gold_player_financial_lock_command as cmd')
					.select('cmd.status_message')
					.whereRaw('cmd.player_id = players.id')
					.orderBy('cmd.id', 'desc')
					.limit(1)
					.toString()}) as lastCommandStatusMessage`))
				.select(connection.raw(`(${connection('gold_player_financial_lock_command as cmd')
					.select('cmd.processed_at')
					.whereRaw('cmd.player_id = players.id')
					.orderBy('cmd.id', 'desc')
					.limit(1)
					.toString()}) as lastCommandProcessedAt`))
				.orderBy('lockState.updated_at', 'desc')
				.orderBy('players.id', 'desc')
				.limit(pagination.limit)
				.offset(pagination.offset);

			const list = rows.map((row) => ({
				playerId: toSafeNumber(row.playerId),
				playerName: row.playerName || 'Unknown',
				level: toSafeNumber(row.level),
				reason: row.reason || '',
				lockedByPlayerId: row.lockedByPlayerId ? toSafeNumber(row.lockedByPlayerId) : null,
				lockedByNameSnapshot: row.lockedByNameSnapshot || null,
				updatedAt: toSafeTimestamp(row.updatedAt),
				isOnline: Boolean(toSafeNumber(row.isOnline)),
				totalGold: toSafeNumber(row.totalGold),
				lastCommand: {
					status: row.lastCommandStatus || null,
					statusMessage: row.lastCommandStatusMessage || '',
					processedAt: toSafeTimestamp(row.lastCommandProcessedAt),
				},
			}));

			return {
				status: 200,
				message: {
					...wrapList(list, Number(total) || 0, pagination.page),
					snapshotAt: latestStockSnapshot ? toSafeTimestamp(latestStockSnapshot.snapshotAt) : null,
					search: normalizedSearch,
					source: 'financial_lock_state',
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyLockedPlayersRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const getEconomyPlayerFinancialHistoryRepository = async (playerId, { page = 1, viewMode = PLAYER_FINANCIAL_HISTORY_VIEW_MODE.GROUPED } = {}) => {
		const safePlayerId = Math.max(1, toSafeNumber(playerId));
		if (!safePlayerId) {
			return { status: 400, message: 'Invalid player id.' };
		}

		const pagination = buildPagination(page, PLAYER_FINANCIAL_HISTORY_PAGE_SIZE);
		const fetchLimit = pagination.page * pagination.limit;
		const resolvedViewMode = normalizePlayerFinancialHistoryViewMode(viewMode);

		try {
			const timeStorageMode = await getAuditTimeStorageMode();
			const dayBucketGroupExpression = buildDayBucketGroupExpression('fact.occurred_at', timeStorageMode);

			const factBaseQuery = () => connection('gold_audit_event_fact as fact')
				.whereIn('fact.class_id', [CLASS_IDS.FAUCET, CLASS_IDS.SINK, CLASS_IDS.TRANSFER])
				.andWhere((builder) => {
					builder.where('fact.actor_player_id', safePlayerId)
						.orWhere('fact.beneficiary_player_id', safePlayerId)
						.orWhere('fact.counterparty_player_id', safePlayerId)
						.orWhere('fact.looter_player_id', safePlayerId)
						.orWhere('fact.killer_player_id', safePlayerId);
				});

			const dbTriggerBaseQuery = () => connection('gold_audit_admin_intervention_v as intervention')
				.where('intervention.record_source', 'DB_TRIGGER')
				.andWhere('intervention.subject_player_id', safePlayerId);

			const buildRawFactRowsQuery = () => factBaseQuery().clone()
					.leftJoin('gold_mechanism_dim as mechanism', 'mechanism.id', 'fact.mechanism_id')
					.leftJoin('gold_origin_root_dim as origin', 'origin.id', 'fact.origin_root_id')
					.leftJoin('players as actor', 'actor.id', 'fact.actor_player_id')
					.leftJoin('players as beneficiary', 'beneficiary.id', 'fact.beneficiary_player_id')
					.leftJoin('players as counterparty', 'counterparty.id', 'fact.counterparty_player_id')
					.select(
						'fact.boot_id as bootId',
						'fact.event_seq as eventSeq',
						'fact.class_id as classId',
						buildTimestampSelect('fact.occurred_at', 'occurredAt', timeStorageMode),
						'fact.amount',
						'fact.house_id as houseId',
						'fact.source_ref_id as sourceRefId',
						'fact.source_name_snapshot as sourceNameSnapshot',
						'fact.actor_player_id as actorPlayerId',
						'actor.name as actorPlayerName',
						'fact.beneficiary_player_id as beneficiaryPlayerId',
						'beneficiary.name as beneficiaryPlayerName',
						'fact.counterparty_player_id as counterpartyPlayerId',
						'counterparty.name as counterpartyPlayerName',
						'mechanism.name as mechanismName',
						'origin.name as originName'
					);

			const buildDbTriggerRowsQuery = () => dbTriggerBaseQuery().clone()
					.select(
						'record_source as recordSource',
						'source_row_id as sourceRowId',
						buildTimestampSelect('occurred_at', 'occurredAt', timeStorageMode),
						'change_direction as changeDirection',
						'mechanism_name as mechanismName',
						'amount',
						'source_name_snapshot as sourceNameSnapshot',
						'balance_before as balanceBefore',
						'balance_after as balanceAfter'
					);

			let mergedRows = [];
			let totalCount = 0;

			if (resolvedViewMode === PLAYER_FINANCIAL_HISTORY_VIEW_MODE.DETAILED) {
				const [{ total: factTotal }, { total: dbTriggerTotal }, factRows, dbTriggerRows] = await Promise.all([
					factBaseQuery().clone().count({ total: '*' }).first(),
					dbTriggerBaseQuery().clone().count({ total: '*' }).first(),
					buildRawFactRowsQuery().orderBy('fact.occurred_at', 'desc').limit(fetchLimit),
					buildDbTriggerRowsQuery().orderBy('intervention.occurred_at', 'desc').limit(fetchLimit),
				]);

				totalCount = toSafeNumber(factTotal?.total || factTotal) + toSafeNumber(dbTriggerTotal?.total || dbTriggerTotal);
				mergedRows = [
					...factRows.map((row) => normalizePlayerFinancialHistoryFactRow(row, safePlayerId)),
					...dbTriggerRows.map(normalizePlayerFinancialHistoryInterventionRow),
				];
			} else {
				const groupedMonsterLootBaseQuery = () => factBaseQuery().clone()
					.where('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM)
					.andWhere('fact.state_id', STATE_IDS.REALIZED);

				const nonMonsterLootFactBaseQuery = () => factBaseQuery().clone()
					.whereNot('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM);

				const groupedMonsterLootCountQuery = connection
					.from(
						groupedMonsterLootBaseQuery().clone()
							.select(connection.raw('1'))
							.groupByRaw(dayBucketGroupExpression)
							.groupBy('fact.monster_dim_id', 'fact.source_name_snapshot')
							.as('groupedMonsterLoot')
					)
					.count({ total: '*' })
					.first();

				const groupedMonsterLootRowsQuery = groupedMonsterLootBaseQuery().clone()
					.select(
						buildTimestampSelect('MAX(fact.occurred_at)', 'occurredAt', timeStorageMode),
						buildDayBucketSelect('fact.occurred_at', 'groupedDay', timeStorageMode),
						connection.raw('SUM(fact.amount) AS amount'),
						connection.raw('COUNT(*) AS lootEventCount'),
						connection.raw('MAX(fact.source_name_snapshot) AS sourceNameSnapshot')
					)
					.groupByRaw(dayBucketGroupExpression)
					.groupBy('fact.monster_dim_id', 'fact.source_name_snapshot')
					.orderBy('occurredAt', 'desc')
					.limit(fetchLimit);

				const [{ total: groupedMonsterLootTotal }, { total: rawFactTotal }, { total: dbTriggerTotal }, groupedMonsterLootRows, rawFactRows, dbTriggerRows] = await Promise.all([
					groupedMonsterLootCountQuery,
					nonMonsterLootFactBaseQuery().clone().count({ total: '*' }).first(),
					dbTriggerBaseQuery().clone().count({ total: '*' }).first(),
					groupedMonsterLootRowsQuery,
					buildRawFactRowsQuery().whereNot('fact.mechanism_id', MECHANISM_IDS.MONSTER_GOLD_CLAIM).orderBy('fact.occurred_at', 'desc').limit(fetchLimit),
					buildDbTriggerRowsQuery().orderBy('intervention.occurred_at', 'desc').limit(fetchLimit),
				]);

				totalCount = toSafeNumber(groupedMonsterLootTotal?.total || groupedMonsterLootTotal)
					+ toSafeNumber(rawFactTotal?.total || rawFactTotal)
					+ toSafeNumber(dbTriggerTotal?.total || dbTriggerTotal);

				mergedRows = [
					...groupedMonsterLootRows.map(normalizePlayerFinancialHistoryGroupedMonsterLootRow),
					...rawFactRows.map((row) => normalizePlayerFinancialHistoryFactRow(row, safePlayerId)),
					...dbTriggerRows.map(normalizePlayerFinancialHistoryInterventionRow),
				];
			}

			mergedRows = mergedRows.sort((left, right) => {
				const byTime = toSafeNumber(right.occurredAt) - toSafeNumber(left.occurredAt);
				if (byTime !== 0) {
					return byTime;
				}

				return String(right.eventId).localeCompare(String(left.eventId));
			});

			const pageRows = mergedRows.slice(pagination.offset, pagination.offset + pagination.limit);

			return {
				status: 200,
				message: {
					...wrapList(pageRows, totalCount, pagination.page, pagination.limit),
					playerId: safePlayerId,
					viewMode: resolvedViewMode,
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] getEconomyPlayerFinancialHistoryRepository error:', err);
			return { status: 500, message: formatDbErrorMessage(err) };
		}
	};

	const setEconomyPlayerFinancialLockRepository = async (playerId, { locked, reason, admin } = {}) => {
		const safePlayerId = Math.max(1, toSafeNumber(playerId));
		if (!safePlayerId) {
			return { status: 400, message: 'Invalid player id.' };
		}

		try {
			await ensureFinancialLockTables();
			await ensurePunishmentTable();
			const playerExists = await connection('players')
				.select('id', 'account_id as accountId')
				.where('id', safePlayerId)
				.first();

			if (!playerExists) {
				return { status: 404, message: 'Player not found.' };
			}

			const requestedState = locked ? 1 : 0;
			const now = Date.now();
			const normalizedReason = requestedState
				? (clampText(reason, 255) || 'Investigacao financeira via painel admin.')
				: '';
			const adminId = toSafeNumber(admin?.id) || null;
			const adminName = clampText(admin?.name || admin?.email || 'website-admin', 64);
			let commandId = 0;

			await connection.transaction(async (trx) => {
				await trx.raw(
					"INSERT INTO `gold_player_financial_lock_state` (`player_id`, `is_locked`, `reason`, `locked_by_player_id`, `locked_by_name_snapshot`, `updated_at`) VALUES (?, ?, ?, ?, ?, ?) " +
					"ON DUPLICATE KEY UPDATE `is_locked` = VALUES(`is_locked`), `reason` = VALUES(`reason`), `locked_by_player_id` = VALUES(`locked_by_player_id`), `locked_by_name_snapshot` = VALUES(`locked_by_name_snapshot`), `updated_at` = VALUES(`updated_at`)",
					[safePlayerId, requestedState, normalizedReason, adminId, adminName, now],
				);

				const inserted = await trx('gold_player_financial_lock_command').insert({
					player_id: safePlayerId,
					requested_state: requestedState,
					reason: normalizedReason,
					requested_by_player_id: adminId,
					requested_by_name_snapshot: adminName,
					requested_at: now,
					status: 'PENDING',
					status_message: requestedState ? 'lock queued' : 'unlock queued',
				});

				commandId = Array.isArray(inserted) ? toSafeNumber(inserted[0]) : toSafeNumber(inserted);

				await upsertPunishmentEntry(trx, {
					playerId: safePlayerId,
					accountId: playerExists.accountId ? toSafeNumber(playerExists.accountId) : null,
					punishmentType: requestedState ? 'FINANCIAL_LOCK' : 'FINANCIAL_UNLOCK',
					severity: requestedState ? 'HIGH' : 'INFO',
					status: 'QUEUED',
					reason: requestedState ? normalizedReason : 'Desbloqueio financeiro via painel admin.',
					notes: requestedState ? 'Alteracao registrada pelo painel admin.' : 'Remocao registrada pelo painel admin.',
					sourceTable: 'gold_player_financial_lock_command',
					sourceRefId: commandId || null,
					sourceFingerprint: buildPunishmentSourceFingerprint('gold_player_financial_lock_command', [commandId || safePlayerId]),
					recordedAt: now,
					startsAt: now,
					expiresAt: null,
					createdByPlayerId: adminId,
					createdByNameSnapshot: adminName,
					updatedAt: now,
				});
			});

			const profileResponse = await getEconomyPlayerProfileRepository(safePlayerId);
			if (profileResponse.status !== 200) {
				return profileResponse;
			}

			return {
				status: 200,
				message: {
					...profileResponse.message,
					action: {
						commandId,
						requestedState: Boolean(requestedState),
						queuedAt: now,
						status: 'PENDING',
					},
				},
			};
		} catch (err) {
			console.log('[EconomyRepository] setEconomyPlayerFinancialLockRepository error:', err);
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
			)
				.where('fact.class_id', CLASS_IDS.TRANSFER)
				.whereIn('fact.mechanism_id', REAL_PLAYER_TRANSFER_MECHANISM_IDS)
				.whereNotNull('fact.actor_player_id')
				.whereNotNull('fact.beneficiary_player_id')
				.whereRaw('fact.actor_player_id <> fact.beneficiary_player_id');

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
					'fact.house_id as houseId',
					'fact.source_ref_id as sourceRefId',
					'fact.source_name_snapshot as sourceNameSnapshot',
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
				houseId: row.houseId ? Number(row.houseId) : null,
				sourceRefId: row.sourceRefId ? Number(row.sourceRefId) : null,
				sourceNameSnapshot: row.sourceNameSnapshot || null,
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
		getEconomyPlayerProfileRepository,
		getEconomyPlayerFinancialHistoryRepository,
		getEconomyLockedPlayersRepository,
		setEconomyPlayerFinancialLockRepository,
		getEconomyTransfersRepository,
	};
};
