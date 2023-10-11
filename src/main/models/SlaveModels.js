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
    return connectionDBSlave('cupoms');
}



module.exports = { streamers, streamers_live_check_time, cupoms, payments }