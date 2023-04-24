const { players, guilds, guild_invites, guild_membership, guild_ranks, 
    guild_wars, guildwar_kills } = require('../models/projectModels');

const getGuildList = async () => {
  try {
    const guildList = await guilds.query().select('*');
    return { status: 200, message: JSON.stringify(guildList) };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

module.exports = {
    getGuildList
}