const connection = require('../config/dbMasterConf');
const { tickets } = require('../models/SlaveModels');

// EconomyRealtimeService
// ----------------------
// Polls the master DB for the latest `gold_server_stock_snapshot` row and broadcasts
// it on the admin Socket.IO namespace whenever a newer one shows up. We poll instead
// of having the game server call out via HTTP because TFS does not ship with an
// HTTP client and the snapshot cadence (5min + boot/shutdown) is comfortably within
// a polling interval.
//
// The same loop also watches the latest ticket id so the admin dashboard can react
// to new tickets without refreshing.

// Polling cadence. Minimum is enforced at 30s because each tick fans out 5 SELECTs
// (snapshot, latest fact event, pending summary, db mutation, anomaly) plus a tickets
// query, and the dashboard does not need sub-30s freshness. Operators can raise the
// interval via `ECONOMY_REALTIME_POLL_MS`, but they cannot lower it below 30s.
const POLL_INTERVAL_FLOOR_MS = 30000;
const POLL_INTERVAL_MS = Math.max(POLL_INTERVAL_FLOOR_MS, Number(process.env.ECONOMY_REALTIME_POLL_MS) || POLL_INTERVAL_FLOOR_MS);
const IGNORABLE_SCHEMA_ERRORS = ['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR', 'ER_BAD_FIELD_ERROR'];

const toSafeNumber = (value) => Number(value) || 0;

const isIgnorableSchemaError = (err) => IGNORABLE_SCHEMA_ERRORS.includes(err && err.code);

const safeProbe = async (queryFactory) => {
	try {
		return await queryFactory();
	} catch (err) {
		if (isIgnorableSchemaError(err)) {
			return null;
		}
		throw err;
	}
};

const buildSnapshotPayload = (row) => {
	if (!row) return null;
	return {
		id: row.id,
		snapshotAt: row.snapshot_at,
		triggerName: row.trigger_name,
		scanDurationMs: row.scan_duration_ms,
		onlinePlayers: row.online_players,
		offlinePlayers: row.offline_players,
		bankGold: Number(row.bank_gold) || 0,
		inventoryGold: Number(row.inventory_gold) || 0,
		depotGold: Number(row.depot_gold) || 0,
		houseGold: Number(row.house_gold) || 0,
		worldGold: Number(row.world_gold) || 0,
		totalGold: Number(row.total_gold) || 0,
	};
};

const buildFinancialLockPayload = (row) => {
	if (!row) return null;
	return {
		commandId: toSafeNumber(row.id),
		playerId: toSafeNumber(row.player_id),
		locked: toSafeNumber(row.requested_state) !== 0,
		status: row.status || null,
		statusMessage: row.status_message || '',
		processedAt: toSafeNumber(row.processed_at) || 0,
		phase: 'applied',
	};
};

const start = (adminNamespace) => {
	if (!adminNamespace) {
		console.warn('[EconomyRealtimeService] adminNamespace not provided; skipping start.');
		return null;
	}

	let lastSnapshotId = 0;
	let lastEconomySignature = null;
	let lastAppliedFinancialLockCommandId = 0;
	let lastTicketId = 0;
	let stopped = false;

	const tick = async () => {
		if (stopped) return;
		try {
			const [snap, latestAuditEvent, pendingSummary, latestDbMutation, latestAnomaly, latestFinancialLockCommand] = await Promise.all([
				safeProbe(() => connection('gold_server_stock_snapshot')
					.orderBy('id', 'desc')
					.first()),
				safeProbe(() => connection('gold_audit_event_fact')
					.select('boot_id', 'event_seq', 'occurred_at')
					.orderBy('occurred_at', 'desc')
					.orderBy('boot_id', 'desc')
					.orderBy('event_seq', 'desc')
					.first()),
				safeProbe(() => connection('gold_pending_world')
					.count({ totalEntries: '*' })
					.select(connection.raw('COALESCE(SUM(current_value), 0) AS totalValue'))
					.first()),
				safeProbe(() => connection('gold_db_balance_mutation')
					.select('id')
					.orderBy('id', 'desc')
					.first()),
				safeProbe(() => connection('gold_audit_anomaly')
					.select('id')
					.orderBy('id', 'desc')
					.first()),
				safeProbe(() => connection('gold_player_financial_lock_command')
					.select('id', 'player_id', 'requested_state', 'status', 'status_message', 'processed_at')
					.where('status', 'APPLIED')
					.orderBy('id', 'desc')
					.first()),
			]);

			const snapshotChanged = snap && Number(snap.id) > lastSnapshotId;
			if (snap && Number(snap.id) > lastSnapshotId) {
				const isFirstTick = lastSnapshotId === 0;
				lastSnapshotId = Number(snap.id);
				if (!isFirstTick) {
					console.log('[EconomyRealtimeService] emit economy:stock_updated snapshotId=%s', lastSnapshotId);
					adminNamespace.emit('economy:stock_updated', buildSnapshotPayload(snap));
					// Note: we intentionally DO NOT also emit `economy:refresh` here.
					// `economy:stock_updated` already triggers a dashboard reload on the
					// frontend (`useAdminSocket` -> `lastStockUpdate`). Emitting both on
					// the same tick caused the admin page to fan out ~2x the requests
					// per snapshot bump and contributed to hitting the rate limiter.
				}
			}

			const nextEconomySignature = [
				toSafeNumber(latestAuditEvent?.boot_id),
				toSafeNumber(latestAuditEvent?.event_seq),
				toSafeNumber(latestAuditEvent?.occurred_at),
				toSafeNumber(pendingSummary?.totalEntries),
				toSafeNumber(pendingSummary?.totalValue),
				toSafeNumber(latestDbMutation?.id),
				toSafeNumber(latestAnomaly?.id),
			].join(':');

			if (lastEconomySignature !== null && nextEconomySignature !== lastEconomySignature && !snapshotChanged) {
				console.log('[EconomyRealtimeService] emit economy:refresh reason=economy-data-changed signature=%s -> %s', lastEconomySignature, nextEconomySignature);
				adminNamespace.emit('economy:refresh', {
					reason: 'economy-data-changed',
				});
			}

			if (latestFinancialLockCommand && Number(latestFinancialLockCommand.id) > lastAppliedFinancialLockCommandId) {
				const isFirstTick = lastAppliedFinancialLockCommandId === 0;
				lastAppliedFinancialLockCommandId = Number(latestFinancialLockCommand.id);
				if (!isFirstTick) {
					console.log('[EconomyRealtimeService] emit economy:financial_lock_updated commandId=%s status=%s', lastAppliedFinancialLockCommandId, latestFinancialLockCommand.status);
					adminNamespace.emit('economy:financial_lock_updated', buildFinancialLockPayload(latestFinancialLockCommand));
				}
			}

			lastEconomySignature = nextEconomySignature;
		} catch (err) {
			if (!isIgnorableSchemaError(err)) {
				console.error('[EconomyRealtimeService] snapshot poll error:', err && err.message);
			}
		}

		try {
			const ticket = await tickets().orderBy('id', 'desc').first();
			if (ticket && Number(ticket.id) > lastTicketId) {
				const isFirstTick = lastTicketId === 0;
				lastTicketId = Number(ticket.id);
				if (!isFirstTick) {
					adminNamespace.emit('tickets:new', {
						id: ticket.id,
						subject: ticket.subject || ticket.title || null,
						status: ticket.status || null,
						createdAt: ticket.created_at || ticket.createdAt || null,
					});
				}
			}
		} catch (err) {
			// tickets table may live on a different DB or not exist in dev; do not spam logs
			if (!isIgnorableSchemaError(err)) {
				console.error('[EconomyRealtimeService] tickets poll error:', err && err.message);
			}
		}
	};

	const interval = setInterval(tick, POLL_INTERVAL_MS);
	// kick off immediately so lastSnapshotId/lastTicketId are seeded
	tick();

	return {
		stop: () => {
			stopped = true;
			clearInterval(interval);
		},
	};
};

module.exports = { start };
