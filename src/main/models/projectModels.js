const { Model } = require('objection');
const connection = require('../config/db');

Model.knex(connection);

class players_online extends Model {
    static tableName = 'players_online'
}

class accounts extends Model {
    static tableName = 'accounts'
}

class players extends Model {
    static tableName = 'players'
}

class player_deaths extends Model {
    static tableName = 'player_deaths'
}

class worlds extends Model {
    static tableName = 'worlds'
}

class player_items extends Model {
    static tableName = 'player_items'
}

module.exports = { players_online, accounts, players, player_deaths, worlds, player_items }