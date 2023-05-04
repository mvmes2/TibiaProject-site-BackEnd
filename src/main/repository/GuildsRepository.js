const { players, guilds, guild_invites, guild_membership, guild_ranks,
  guild_wars, guildwar_kills, accounts } = require('../models/projectModels');

const getGuildList = async () => {
  try {
    const guildList = await guilds.query().select('*');
    return { status: 200, message: JSON.stringify(guildList) };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const getGuildInformation = async (data) => {
  try {
    const guildInfo = await guilds.query()
      .join('worlds', 'guilds.world_id', '=', 'worlds.id')
      .select('guilds.*', 'worlds.serverName as worldName').where('guilds.id', data.guild_id).first();
console.log(' o que veio aqui em guildInfo? ', guildInfo)
    const guildOnwerName = await players.query().select('name').where({ id: guildInfo.ownerid }).first()

    const memberList = await guild_membership.query()
      .join('players', 'guild_membership.player_id', '=', 'players.id')
      .join('vocations', 'players.vocation', '=', 'vocations.vocation_id')
      .join('guild_ranks', 'guild_membership.rank_id', '=', 'guild_ranks.id')
      .select('guild_membership.*', 'players.name as playerName', 'guild_ranks.name as rankName',
        'vocations.vocation_name as vocationName', 'players.level as playerLevel', 'guild_ranks.level as rankLevel')
      .where('guild_membership.guild_id', data.guild_id)
      .orderBy('guild_membership.rank_id');

    const guildInvites = await guild_invites.query()
      .join('players', 'guild_invites.player_id', '=', 'players.id')
      .select('guild_invites.*', 'players.name as playerName')
      .where('guild_invites.guild_id', data.guild_id);

    const guildRanks = await guild_ranks.query().select('*')
      .where({ guild_id: data.guild_id })
      .orderBy('guild_ranks.level', 'DESC');

    const newGuildInfos = {
      ...guildInfo,
      ownerName: guildOnwerName.name,
      memberList,
      guildRanks,
      guildInvites
    }

    return { status: 200, message: newGuildInfos };
  } catch (err) {
    console.log('internal error while trying to retrieve guildMembersList at: getGuildMembersList, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildAcceptInvitation = async (data) => {
  try {
    // remove guild_invite from accepted character
    await guild_invites.query().delete().where({ player_id: data.player_id });
    // get Member rank id from accepted guild.
    const getMemberRank = await guild_ranks.query().select('id')
      .where({ guild_id: data.guild_id })
      .where({ name: 'Member' }).first();
    // insert player to guildMembers
    await guild_membership.query().insert({ player_id: data.player_id, guild_id: data.guild_id, rank_id: getMemberRank.id });
    return { status: 201, message: 'New member added to guild!' };
  } catch (err) {
    console.log('internal error while trying to insert new Guild Member at: guildAcceptInvitation, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const characterToRemoveFromGuild = async (data) => {
  try {
    await guild_membership.query().delete().where({ player_id: data.player_id });
    return { status: 200, message: 'Character Removed from guild' };
  } catch (err) {
    console.log('internal error while trying to remove character from Guild at: characterToRemoveFromGuild, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const newGuildInvite = async (data) => {
  try {
    const CheckIfHaveGuild = await guild_membership.query().select('player_id').where({ player_id: data.player_id });
    if (CheckIfHaveGuild?.length > 0) {
      return { status: 403, message: 'Player already in a guild! cannot be invited.' };
    }
    await guild_invites.query().insert(data);
    return { status: 200, message: 'Character invited to Guild' };
  } catch (err) {
    console.log('internal error while trying to invite new character to guild at: newGuildInvite, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildInviteCancel = async (data) => {
  try {
    await guild_invites.query().delete().where({ guild_id: data.guild_id }).where({ player_id: data.player_id });
    return { status: 200, message: 'Character invitation canceled' };
  } catch (err) {
    console.log('internal error while trying to cancel guild invite at: guildInviteCancel, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildUpdateMember = async (data) => {
  console.log('o que ta vindo nessa joça? ', data)
  try {
    if (data.rank_level === 3) {
      const getMemberRank = await guild_ranks.query().select('id')
        .where({ guild_id: data.guild_id })
        .where({ name: 'Member' }).first();
      const getFormerLeaderId = await players.query().select('id').where({ name: data.former_player_name }).where({ account_id: data.former_player_account_id }).first();

      await guild_membership.query().update({ rank_id: getMemberRank.id }).where({ player_id: getFormerLeaderId.id }).where({ guild_id: data.guild_id });
      await guilds.query().update({ ownerid: data.player_id }).where({ id: data.guild_id });
    }
    await guild_membership.query().update(data.update).where({ player_id: data.player_id }).where({ guild_id: data.guild_id });
    
    return { status: 200, message: 'Member updated successfuly' };
  } catch (err) {
    console.log('internal error while trying to update guild member at: guildUpdateMember, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildCreateNewRank = async (data) => {
  console.log('wtf?   ', data)
  try {
    const checkIfRankExists = await guild_ranks.query().select('name').where({ guild_id: data.guild_id }).where({ name: data.name });
    if (checkIfRankExists?.length > 0) {
      return { status: 403, message: 'Rank name already exists on this guild!' }
    }
    await guild_ranks.query().insert(data);
    return { status: 200, message: 'Guild Rank Created!' };
  } catch (err) {
    console.log('internal error while trying to create new guild rank at: guildCreateNewRank, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildChangeRankName = async (data) => {
  console.log(' o que ta vindo no data de ?... ', data)
  try {
    await guild_ranks.query().update(data.update).where({ id: data.id }).where({ guild_id: data.guild_id });
    return { status: 200, message: 'Guild Rank Name Changed!' };
  } catch (err) {
    console.log('internal error while trying to change rank name at: guildChangeRankName, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const guildDeleteRank = async (data) => {
  console.log('o que ta vindo no delete? ', data)
  try {
    await guild_ranks.query().delete().where({ id: data.rank_id }).where({ guild_id: data.guild_id });
    return { status: 200, message: 'Guild Rank Deleted!' };
  } catch (err) {
    console.log('internal error while trying to delete guild rank at: guildDeleteRank, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const createNewGuild = async (data) => {
  try {
    const checkIfHaveCoins = await accounts.query().select('coins').where({ id: data.account_id }).first();
    const checkIfGuildNameExists = await guilds.query().select('name').where({ name: data.insert.name });

    if (checkIfGuildNameExists?.length > 0) {
      return { status: 403, message: 'Guild name already in use!!' }
    }
    if (!checkIfHaveCoins || checkIfHaveCoins === undefined || checkIfHaveCoins === null) {
      return { status: 403, message: 'Some Problem with your account, try log-in again!' }
    }
    if (Number(checkIfHaveCoins.coins) >= 5) {
      await accounts.query().update({ coins: (Number(checkIfHaveCoins.coins) - 5) }).where({ id: data.account_id });
      const checkIfGuildMasterAlreadyIsGuildMember = await guild_membership.query().select('player_id').where({ player_id: data.insert.ownerid });

      if (checkIfGuildMasterAlreadyIsGuildMember?.length > 0) {
        return { status: 403, message: 'This character is already in a guild!' }
      }

      const guildCreated = await guilds.query().insert(data.insert);
      const getLeaderRankId = await guild_ranks.query().select('id').where({ level: 3 }).where({ name: 'The Leader' }).where({ guild_id: guildCreated.id }).first();
      console.log('o que temos em rankLeaderId?  ', getLeaderRankId)
      console.log('o que temos em guildCreated pegar id?  ', guildCreated)
      await guild_membership.query(). insert({ player_id: data.insert.ownerid, guild_id: guildCreated.id, rank_id: getLeaderRankId.id });
      return { status: 201, message: 'Guild Created!' }
    }
  } catch (err) {
    console.log('internal error while trying to create guild at: createNewGuild, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

module.exports = {
  getGuildList,
  getGuildInformation,
  guildAcceptInvitation,
  characterToRemoveFromGuild,
  newGuildInvite,
  guildInviteCancel,
  guildUpdateMember,
  guildCreateNewRank,
  guildChangeRankName,
  guildDeleteRank,
  createNewGuild
}