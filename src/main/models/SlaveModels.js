const knexSlave = require('../../../knexfile-slave');
const knex = require('knex');
const connectionDBSlave = knex(knexSlave);

const livestreams = () => {
    return connectionDBSlave('livestreams');
}

const streamers = () => {
    return connectionDBSlave('streamers');
}

const streamers_live_check_time = () => {
    return connectionDBSlave('streamers_live_check_time');
}

module.exports = { livestreams, streamers, streamers_live_check_time }