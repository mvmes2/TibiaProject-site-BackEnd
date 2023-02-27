const { Model } = require('objection');
const connection = require('../config/db');

Model.knex(connection);

class players_online extends Model {
    static tableName = 'players_online'
}

class accounts extends Model {
    static tableName = 'accounts'
}

module.exports = { players_online, accounts }