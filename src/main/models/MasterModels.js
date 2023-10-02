const { Model } = require('objection');
const connection = require('../config/dbMasterConf');

Model.knex(connection);

class players_online extends Model {
    static tableName = 'players_online'
}

class accounts extends Model {
    static tableName = 'accounts'
}

class players extends Model {
    static tableName = 'players';
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

class players_comment extends Model {
    static tableName = 'players_comment'
}

class products extends Model {
    static tableName = 'products'
}

class payments extends Model {
    static tableName = 'payments'
}

class tickets extends Model {
    static tableName = 'tickets'
}

class tickets_response extends Model {
    static tableName = 'tickets_response'
}

class tickets_images extends Model {
    static tableName = 'tickets_images'
}

class tickets_response_images extends Model {
    static tableName = 'tickets_response_images'
}

class players_titles extends Model {
    static tableName = 'players_titles'
}

class guilds extends Model {
    static tableName = 'guilds'
}

class guild_invites extends Model {
    static tableName = 'guild_invites'
}

class guild_membership extends Model {
    static tableName = 'guild_membership'
}

class guild_ranks extends Model {
    static tableName = 'guild_ranks'
}

class guild_wars extends Model {
    static tableName = 'guild_wars'
}

class guildwar_kills extends Model {
    static tableName = 'guildwar_kills'
}

module.exports = { players_online, accounts, players, player_deaths, worlds, player_items, 
    players_comment, products, payments, tickets, tickets_response, tickets_images, 
    tickets_response_images, players_titles, guilds, guild_invites, guild_membership, guild_ranks, 
    guild_wars, guildwar_kills }