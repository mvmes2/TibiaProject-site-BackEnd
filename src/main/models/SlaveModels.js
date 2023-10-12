const knexSlave = require('../../../knexfile-slave');
const knex = require('knex');
const connectionDBSlave = knex(knexSlave);

const streamers = () => {
    return connectionDBSlave('streamers');
}

const streamers_live_check_time = () => {
    return connectionDBSlave('streamers_live_check_time');
}

const cupoms = () => {
    return connectionDBSlave('cupoms');
}

const payments = () => {
    return connectionDBSlave('payments');
}

const redeem_cupom_storage = () => {
    return connectionDBSlave('redeem_cupom_storage');
}

module.exports = { streamers, streamers_live_check_time, cupoms, payments, redeem_cupom_storage };
