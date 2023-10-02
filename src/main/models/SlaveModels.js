const knexSlave = require('../../../knexfile-slave');
const knex = require('knex');
const connectionDBSlave = knex(knexSlave);

const streamers = () => {
    return connectionDBSlave('streamers');
}

module.exports = { streamers }