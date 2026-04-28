const emitAdminEvent = (eventName, payload = {}) => {
  try {
    const { adminNamespace } = require('../../../server');
    if (!adminNamespace || typeof adminNamespace.emit !== 'function') {
      return false;
    }

    adminNamespace.emit(eventName, {
      at: Date.now(),
      ...payload,
    });
    return true;
  } catch (err) {
    console.error('[AdminRealtimeService] emit error:', err && err.message);
    return false;
  }
};

const emitTicketsRefresh = (payload = {}) => emitAdminEvent('tickets:refresh', payload);

module.exports = {
  emitAdminEvent,
  emitTicketsRefresh,
};