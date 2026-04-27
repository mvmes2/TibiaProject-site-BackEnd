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

const POLL_INTERVAL_MS = Number(process.env.ECONOMY_REALTIME_POLL_MS) || 30000;

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

const start = (adminNamespace) => {
	if (!adminNamespace) {
		console.warn('[EconomyRealtimeService] adminNamespace not provided; skipping start.');
		return null;
	}

	let lastSnapshotId = 0;
	let lastTicketId = 0;
	let stopped = false;

	const tick = async () => {
		if (stopped) return;
		try {
			const snap = await connection('gold_server_stock_snapshot')
				.orderBy('id', 'desc')
				.first();
			if (snap && Number(snap.id) > lastSnapshotId) {
				const isFirstTick = lastSnapshotId === 0;
				lastSnapshotId = Number(snap.id);
				if (!isFirstTick) {
					adminNamespace.emit('economy:stock_updated', buildSnapshotPayload(snap));
				}
			}
		} catch (err) {
			if (!['ER_NO_SUCH_TABLE', 'ER_VIEW_INVALID', 'ER_BAD_TABLE_ERROR'].includes(err && err.code)) {
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
			if (!['ER_NO_SUCH_TABLE', 'ER_BAD_TABLE_ERROR', 'ER_BAD_FIELD_ERROR'].includes(err && err.code)) {
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
