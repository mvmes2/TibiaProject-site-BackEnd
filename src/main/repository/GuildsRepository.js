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

const getGuildMembersList = async (data) => {
  try {
    const memberList = await guild_membership.query().select('*').where({ guild_id: data.guild_id });
    return { status: 200, message: memberList };
  } catch (err) {
    console.log('internal error while trying to retrieve guildMembersList at: getGuildMembersList, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

module.exports = {
    getGuildList,
    getGuildMembersList
}