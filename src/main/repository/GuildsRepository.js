const moment = require('moment');
const { players, guilds, guild_invites, guild_membership, guild_ranks,
  guild_wars, guildwar_kills, accounts } = require('../models/MasterModels');
const { guild_logos } = require('../models/SlaveModels');
const { vocationsArr, setCreateCharacterController, testNameParams, formatName } = require('../utils/utilities');
const fs = require('fs');
const path = require('path');

let getGuildListLastUpdated = 0;
let getGuildListData = 0;
const slaveDatabase = process.env.DB_NAMESLAVE || 'otserv_dbslave';

const getGuildList = async () => {
  if (moment().diff(getGuildListLastUpdated, 'minutes') <= 3) {
    return getGuildListData
  }

  try {
    const guildList = await guilds.query()
    .leftJoin(`${slaveDatabase}.guild_logos`, 'guilds.id', '=', 'guild_logos.guild_id')
    .select('guilds.*', 'guild_logos.logo_url');
    const guildWithoutSensitiveInfo = guildList && guildList?.map((guild) => {
      if (guild.id && guild.ownerid) {
        delete guild.id;
        delete guild.ownerid;
        return guild;
      }
      return guild;
    });

    getGuildListLastUpdated = moment();
    getGuildListData = { status: 200, message: JSON.stringify(guildWithoutSensitiveInfo) }
    return getGuildListData;
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildInformationData = null;
let guildInformationLastUpdated = 0;
let guildInformationSeted = 0;

const getGuildInformation = async (info) => {
  console.log('validation 0 the Data ', info);
  const data = info.guild_name ? info.guild_name : info.name ? info.name : info;

  if (data?.guild_name !== undefined ? guildInformationData?.guild_name == data?.guild_name && moment().diff(guildInformationLastUpdated, 'minutes') <= 5 : guildInformationData == data && moment().diff(guildInformationLastUpdated, 'minutes') <= 5) {
    console.log('Cache GuildInformation aplicado com sucesso!')
    return { status: 200, message: guildInformationSeted };
  }

  try {
    const guildInfo = await guilds.query()
      .join('worlds', 'guilds.world_id', '=', 'worlds.id')
      .leftJoin(`${slaveDatabase}.guild_logos`, 'guilds.id', '=', 'guild_logos.guild_id')
      .select('guilds.*', 'guild_logos.logo_url', 'worlds.server_name as worldName').where('guilds.name', data.guild_name ? data.guild_name : data).first();

    const guildOnwerName = await players.query().select('name').where({ id: guildInfo.ownerid, deletion: 0 }).first()

    const memberList = await guild_membership.query()
      .join('players', 'guild_membership.player_id', '=', 'players.id')
      .join('guild_ranks', 'guild_membership.rank_id', '=', 'guild_ranks.id')
      .select('guild_membership.*', 'players.name as playerName', 'guild_ranks.name as rankName',
        'players.level as playerLevel', 'guild_ranks.level as rankLevel')
      .select(guild_membership.raw('CASE players.vocation ' + vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ') + ' END as vocationName'))
      .where('guild_membership.guild_id', guildInfo.id)
      .orderBy('guild_membership.rank_id');

    const guildInvites = await guild_invites.query()
      .join('players', 'guild_invites.player_id', '=', 'players.id')
      .select('guild_invites.*', 'players.name as playerName')
      .where('guild_invites.guild_id', guildInfo.id);

    const guildRanks = await guild_ranks.query().select('*')
      .where({ guild_id: guildInfo.id })
      .orderBy('guild_ranks.level', 'DESC');

    guildInformationData = data;
    guildInformationLastUpdated = moment();

    delete guildInfo.id;
    delete guildInfo.ownerid;

    const guildInvitesWithoutSensitiveInfos = guildInvites?.map((invites) => {
      if (invites.guild_id && invites.player_id) {
        delete invites.guild_id;
        delete invites.player_id;
        invites.guild_name = guildInfo.name;
        return invites
      }
      return invites
    })

    const guildMemberListWithoutSensitiveInfos = memberList?.map((members) => {
      if (members.player_id && members.guild_id) {
        delete members.player_id;
        delete members.guild_id;
        return members
      }
      return members
    })

    const guildRanksWithoutSensitiveInfos = guildRanks?.map((ranks) => {
      if (ranks.guild_id) {
        delete ranks.guild_id;
        return ranks
      }
      return ranks
    })

    guildInformationSeted = {
      ...guildInfo,
      ownerName: guildOnwerName.name,
      memberList: guildMemberListWithoutSensitiveInfos.sort((a, b) => b.rankLevel - a.rankLevel),
      guildRanks: guildRanksWithoutSensitiveInfos,
      guildInvites: guildInvitesWithoutSensitiveInfos
    }

    return { status: 200, message: guildInformationSeted };
  } catch (err) {
    console.log('internal error while trying to retrieve guildMembersList at: getGuildMembersList, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildAcceptInvitationLastUpdated = 0;
let guildAcceptInvitationCheckAcc = 0;
let guildAcceptInvitationData = 0;

const guildAcceptInvitation = async (data, validatedAccountID) => {
  console.log('Como ta vindo data de guildAcceptInvitation?? ', data);
  if (!data || !data?.player_name || !data?.guild_name) {
    return { status: 400, message: 'Missing data' }
  }

  if (guildAcceptInvitationData == data.player_name && guildAcceptInvitationCheckAcc == validatedAccountID && moment().diff(guildAcceptInvitationLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minute to try again!' }
  }

  try {
    guildAcceptInvitationData = data.player_name
    guildAcceptInvitationCheckAcc = validatedAccountID;
    guildAcceptInvitationLastUpdated = moment();

    const getPlayerIDToInvite = await players.query().select('id', 'account_id').where({ name: data.player_name }).first();
    if (!getPlayerIDToInvite?.id) {
      return { status: 404, message: 'Player not found!' }
    }

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    // const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);
    const targetGuildInvite = await guild_invites.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id, player_id: getPlayerIDToInvite.id }).first();
    if (!targetGuildInvite) {
      return { status: 404, message: 'No pending invite request found for this character in this guild!' }
    }

    const ownsTargetCharacter = getPossiblePlayersFromAccount.some((player) => player.id == getPlayerIDToInvite.id);

    const hasLeaderOrViceRank = getPossiblePlayersFromAccount.some((player) => {
      const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
      if (playerMembership) {
        const rankInfo = getGuildRanks.some((guildRank) =>
          guildRank.id == playerMembership.rank_id && (guildRank.level == 3 || guildRank.level == 2));
        return !!rankInfo;
      }
      return false;
    });

    if (ownsTargetCharacter || hasLeaderOrViceRank) {
      console.log('vualá!');

      // remove guild_invite from accepted character
      await guild_invites.query().delete().where({ player_id: getPlayerIDToInvite.id, guild_id: getGuildOwnerAndGuildID.id });
      // get Member rank id from accepted guild.
      const getMemberRank = await guild_ranks.query().select('id')
        .where({ guild_id: getGuildOwnerAndGuildID.id })
        .where({ level: 1 }).first();
      // insert player to guildMembers
      await guild_membership.query().insert({ player_id: getPlayerIDToInvite.id, guild_id: getGuildOwnerAndGuildID.id, rank_id: getMemberRank.id });
      guildInformationLastUpdated = 6;
      setCreateCharacterController(0);
      return { status: 201, message: 'New member added to guild!' };
    } else {
      return { status: 401, message: 'You do not have permission in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to insert new Guild Member at: guildAcceptInvitation, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let characterToRemoveFromGuildLastUpdated = 0;
let characterToRemoveFromGuildData = 0;
let characterToRemoveFromGuildValidAcc = 0;

const characterToRemoveFromGuild = async (data, validatedAccountID) => {
  console.log('Como ta vindo data de characterToRemoveFromGuild?? ', data);
  if (!data || !data?.player_name) {
    return { status: 400, message: 'Missing data!' }
  }

  if (characterToRemoveFromGuildData == data.player_name && characterToRemoveFromGuildValidAcc == validatedAccountID && moment().diff(characterToRemoveFromGuildLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minuts to retry!' }
  }

  try {

    characterToRemoveFromGuildValidAcc = validatedAccountID;
    characterToRemoveFromGuildLastUpdated = moment();
    characterToRemoveFromGuildData = data.player_name;

    const getPlayerIDToDelete = await players.query().select('id', 'account_id', 'name').where({ name: data.player_name }).first();
    if (!getPlayerIDToDelete?.id) {
      return { status: 404, message: 'Player not found!' }
    }

    const playerHaveGuild = await guild_membership.query().select('player_id').where({ player_id: getPlayerIDToDelete.id });
    if (playerHaveGuild?.length < 1) {
      return { status: 404, message: 'This player is not a guild member!' }
    }

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    // const getGuildOwnerACC = await players.query().select('account_id', 'name').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    console.log('como esta vindo getPlayerIDToDelete? ', getPlayerIDToDelete);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);
    if (getPlayerIDToDelete.id == getGuildOwnerAndGuildID.ownerid) {
      return { status: 401, message: 'Guild leader cannot be removed, pass the leadership first!' }
    }

    const ownCharacter = (getPossiblePlayersFromAccount.some((somePlayer) => getPlayerIDToDelete.id == somePlayer.id));

    const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
      const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
      if (playerMembership) {
        const rankInfo = getGuildRanks.find((guildRank) =>
          guildRank.id == playerMembership.rank_id && (guildRank.level == 3 || guildRank.level == 2));
        return !!rankInfo; // Retorna true se encontrou um líder
      }
      return false;
    });


    if (ownCharacter || hasLeaderRank) {

      const findPlayerToDeletMembership = getPlayerGuildMembership.find((member) => member.player_id == getPlayerIDToDelete.id);
      const isPlayerTodeletViceLeader = getGuildRanks.find((guildRank) => guildRank.id == findPlayerToDeletMembership.rank_id);
      const playerToDeleteIsDiferentFromUserPlayer = !(getPossiblePlayersFromAccount.some((userPlayer) => userPlayer.id == getPlayerIDToDelete.id));

      if (isPlayerTodeletViceLeader?.level == 2 && playerToDeleteIsDiferentFromUserPlayer) {
        return { status: 401, message: 'You cannot remove another vice-leader from guild, only leader can do this action!' }
      }

      await guild_membership.query().delete().where({ player_id: getPlayerIDToDelete.id });
      guildInformationData = null;
      return { status: 200, message: 'Character Removed from guild' };
    } else {
      return { status: 401, message: 'You have no permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to remove character from Guild at: characterToRemoveFromGuild, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let newGuildInviteLastUpdated = 0;
let newGuildInviteCheckAcc = 0;
let newGuildInviteData = 0;

const newGuildInvite = async (data, validatedAccountID) => {
  if (newGuildInviteData.player_name == data.player_name && newGuildInviteCheckAcc == validatedAccountID && moment().diff(newGuildInviteLastUpdated, 'minutes') <= 3) {
    return { status: 400, message: 'You have to wait at least 3 minute to invite again!' }
  }
  try {
    newGuildInviteData = data;
    newGuildInviteLastUpdated = moment();
    newGuildInviteCheckAcc = validatedAccountID;

    const getPlayerIDToInvite = await players.query().select('id', 'account_id', 'name').where({ name: data.player_name }).first();
    if (!getPlayerIDToInvite?.id) {
      return { status: 404, message: 'Player not found!' }
    }

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    // const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    // console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);

    const askedToJoin = getPossiblePlayersFromAccount.some((invitedSome) => invitedSome.id == getPlayerIDToInvite.id && data.asked_to_join == 1);

    const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
      const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
      if (playerMembership) {
        const rankInfo = getGuildRanks.some((guildRank) =>
          guildRank.id == playerMembership.rank_id && (guildRank.level == 3 || guildRank.level == 2));
        return !!rankInfo; // Retorna true se encontrou um líder
      }
      return false;
    });

    if (askedToJoin || hasLeaderRank) {

      // Estágio 2: Verificando se algum dos personagens do jogador é um líder (nível 3 ou vice nivel 2) na guilda

      console.log('vualá!');

      const CheckIfHaveGuild = await guild_membership.query().select('player_id').where({ player_id: getPlayerIDToInvite.id });
      const CheckIfHaveInvite = await guild_invites.query().select('player_id').where({ player_id: getPlayerIDToInvite.id });

      if (CheckIfHaveGuild?.length > 0) {
        return { status: 403, message: 'Player already in a guild! cannot be invited.' };
      }
      if (CheckIfHaveInvite?.length > 0) {
        newGuildInviteLastUpdated = moment();
        newGuildInviteCheckAcc = validatedAccountID;
        return { status: 403, message: 'Player already invited to a guild!' };
      }

      const insertNewGuildInvite = {
        player_id: getPlayerIDToInvite.id,
        guild_id: getGuildOwnerAndGuildID.id,
        date: (Date.now() / 1000),
        asked_to_join: data.asked_to_join == 1 ? 1 : 0
      }
      console.log('como vai invitar? ', insertNewGuildInvite);
      await guild_invites.query().insert(insertNewGuildInvite);
      guildInformationLastUpdated = 6;
      setCreateCharacterController(0);
      return { status: 200, message: 'Character invited to Guild' };
    } else {
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to invite new character to guild at: newGuildInvite, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildInviteCancelLastUpdated = 0;
let guildInviteCancelCheckAccount = 0;
let guildInviteCancelData = 0;

const guildInviteCancel = async (data, validatedAccountID) => {
  if (guildInviteCancelData == data.player_name && guildInviteCancelCheckAccount == validatedAccountID && moment().diff(guildInviteCancelLastUpdated, 'minutes') <= 1) {
    return { status: 401, message: 'You have to wait at least 1 minute do try again!' }
  }
  try {
    guildInviteCancelData = data.player_name;
    guildInviteCancelLastUpdated = moment();
    guildInviteCancelCheckAccount = validatedAccountID;

    const getPlayerIDToInvite = await players.query().select('id', 'account_id', 'name').where({ name: data.player_name }).first();
    if (!getPlayerIDToInvite?.id) {
      return { status: 404, message: 'Player not found!' }
    }

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    // const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    // console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getGuildInvites = await guild_invites.query().select('player_id').where({ player_id: getPlayerIDToInvite.id, guild_id: getGuildOwnerAndGuildID.id });

    // Estágio 1: Verificando se o jogador tem um invite ativo na guilda

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    const hasTargetInviteInGuild = getGuildInvites?.length > 0;
    const hasGuildInvite = hasTargetInviteInGuild && getPossiblePlayersFromAccount.some((player) => player.id == getPlayerIDToInvite.id)

    const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
      const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
      if (playerMembership) {
        const rankInfo = getGuildRanks.some((guildRank) =>
          guildRank.id == playerMembership.rank_id && (guildRank.level == 3 || guildRank.level == 2));
        return !!rankInfo; // Retorna true se encontrou um líder
      }
      return false;
    });

    if (!hasTargetInviteInGuild) {
      return { status: 404, message: 'No active invite found for this character in this guild!' }
    }

    if (hasGuildInvite || hasLeaderRank) {
      console.log('vualá!');
      await guild_invites.query().delete().where({ guild_id: getGuildOwnerAndGuildID.id }).where({ player_id: getPlayerIDToInvite.id });
      guildInformationLastUpdated = 6;
      setCreateCharacterController(0);
      return { status: 200, message: 'Character invitation canceled' };
    } else {
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to cancel guild invite at: guildInviteCancel, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildUpdateMemberLastUpdated = 0;
let guildUpdateMemberData = 0;
let guildUpdateMemberAccValid = 0;

const guildUpdateMember = async (data, validatedAccountID) => {

  if (guildUpdateMemberData.player_name == data.player_name && guildUpdateMemberAccValid == validatedAccountID && moment().diff(guildUpdateMemberLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minutes to try again!' }
  }

  if (!data) return { status: 401, message: 'Missing data, check name field and try again!' }

  const nameToCkeck = data?.update?.nick;
  const warningText = 'nick name';
  const checkParams = testNameParams(nameToCkeck, 15, 4, warningText, false, false);
  if (checkParams) return checkParams;
  if (data?.update?.nick) {
    data.update.nick = formatName(data?.update?.nick);
  }
  try {
    guildUpdateMemberData = data;
    guildUpdateMemberAccValid = validatedAccountID;
    guildUpdateMemberLastUpdated = moment();

    const getPlayerIDToUpdate = await players.query().select('id', 'account_id', 'name').where({ name: data.player_name }).first();
    if (!getPlayerIDToUpdate?.id) {
      return { status: 404, message: 'Player not found!' }
    }

    const playerHaveGuild = await guild_membership.query().select('player_id').where({ player_id: getPlayerIDToUpdate.id });
    if (playerHaveGuild?.length < 1) {
      return { status: 404, message: 'This player is not a guild member!' }
    }

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    // const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    // console.log('como esta vindo getPlayerIDToUpdate? ', getPlayerIDToUpdate);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);


    // Estágio 1: Verificando se o jogador tem um personagem na guilda
    const hasMembershipInGuild = getPossiblePlayersFromAccount.some((itemSome) =>
      getPlayerGuildMembership.some((itemSome2) => itemSome2.player_id == itemSome.id)
    );

    if (hasMembershipInGuild) {
      // Estágio 2: Verificando se algum dos personagens do jogador é um líder (nível 3) na guilda
      const hasLeaderOrViceLeaderRank = getPossiblePlayersFromAccount.some((player) => {
        const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
        if (playerMembership) {
          const rankInfo = getGuildRanks.some((guildRank) =>
            guildRank.id == playerMembership.rank_id && (guildRank.level == 3 || guildRank.level == 2));
          return !!rankInfo; // Retorna true se encontrou um líder
        }
        return false;
      });

      const isLeader = getPossiblePlayersFromAccount.some((player) => {
        const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
        if (playerMembership) {
          const rankInfo = getGuildRanks.find((guildRank) =>
            guildRank.id == playerMembership.rank_id && (guildRank.level == 3));
          return !!rankInfo; // Retorna true se encontrou um líder
        }
        return false;
      });

      if (hasLeaderOrViceLeaderRank) {
        console.log('Sou membro da guilda e tenho rank 2 ou 3 ( lider e vice lider)!');
        if (data?.update?.nick?.length > 15) {
          return { status: 400, message: 'Nick name too long, max 15 characteres!' }
        }
        if (data.rank_level === 3 && isLeader) {
          console.log('Sou membro da guilda 3 (lider)!');
          const getViceLeaderRank = await guild_ranks.query().select('id')
            .where({ guild_id: getGuildOwnerAndGuildID.id })
            .where({ level: 2 }).first();

          const getLeaderRank = await guild_ranks.query().select('id')
            .where({ guild_id: getGuildOwnerAndGuildID.id })
            .where({ level: 3 }).first();
          console.log(data)
          const getFormerLeaderId = await players.query().select('id').where({ name: data.former_player_name, deletion: 0 }).first();
          await guild_membership.query().update({ rank_id: getViceLeaderRank.id }).where({ player_id: getFormerLeaderId.id }).where({ guild_id: getGuildOwnerAndGuildID.id });
          await guild_membership.query().update({ rank_id: getLeaderRank.id, nick: data?.update?.nick ? data?.update?.nick : '' }).where({ player_id: getPlayerIDToUpdate.id }).where({ guild_id: getGuildOwnerAndGuildID.id });
          await guilds.query().update({ ownerid: getPlayerIDToUpdate.id }).where({ id: getGuildOwnerAndGuildID.id });

          setCreateCharacterController(0);
          guildInformationLastUpdated = 6;
          return { status: 200, message: 'Member updated successfuly' };
        }
        await guild_membership.query().update(data.update).where({ player_id: getPlayerIDToUpdate.id }).where({ guild_id: getGuildOwnerAndGuildID.id });
        setCreateCharacterController(0);
        guildInformationLastUpdated = 6;
        return { status: 200, message: 'Member updated successfuly' };
      } else {
        return { status: 401, message: 'Only guild leader and vice leader are able to do this action!' }
      }
    } else {
      guildUpdateMemberAccValid = validatedAccountID;
      guildUpdateMemberLastUpdated = moment();
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to update guild member at: guildUpdateMember, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildCreateNewRankLastUpdated = 0;
let guildCreateNewRankCheckAccount = 0;
let guildCreateNewRankData = 0;

const guildCreateNewRank = async (data, validatedAccountID) => {
  console.log('Como ta vindo a data de guildCreateNewRank ????', data);

  if (!data || !data?.name) {
    return { status: 400, message: 'Missing data to create rank, check the field name and try again!' }
  }

  const warningName = 'guild rank name'
  const nameTocheck = data?.name;
  const checkTest = testNameParams(nameTocheck, 13, 4, warningName, false);
  if (checkTest) return checkTest;
  data.name = formatName(data.name);

  if (guildCreateNewRankData == data.name && guildCreateNewRankCheckAccount == validatedAccountID && moment().diff(guildCreateNewRankLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minute to do this action again!' }
  }

  try {
    guildCreateNewRankData = data.name;
    guildCreateNewRankLastUpdated = moment();
    guildCreateNewRankCheckAccount = validatedAccountID;

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    if (getGuildOwnerACC?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You are not this guild leader!' }
    }
    // console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);

    // Estágio 1: Verificando se o jogador tem um personagem na guilda
    const hasMembershipInGuild = getPossiblePlayersFromAccount.some((itemSome) =>
      getPlayerGuildMembership.some((itemSome2) => itemSome2.player_id == itemSome.id)
    );

    if (hasMembershipInGuild) {
      // Estágio 2: Verificando se algum dos personagens do jogador é um líder (nível 3) na guilda
      const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
        const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
        if (playerMembership) {
          const rankInfo = getGuildRanks.find((guildRank) =>
            guildRank.id == playerMembership.rank_id && guildRank.level == 3
          );
          return !!rankInfo; // Retorna true se encontrou um líder
        }
        return false;
      });

      if (hasLeaderRank) {
        console.log('vualá!');

        data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1);

        const checkIfRankExists = await guild_ranks.query().select('name').where({ guild_id: getGuildOwnerAndGuildID.id }).where({ name: data.name });
        if (checkIfRankExists?.length > 0) {
          return { status: 403, message: 'Rank name already exists on this guild!' }
        }
        const checkRanksQuantity = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });
        if (checkRanksQuantity?.length >= 6) {
          return { status: 401, message: 'You canot add more ranks, limit reached!' }
        }
        const newGuildRankInsert = {
          guild_id: getGuildOwnerAndGuildID.id,
          name: data.name,
          level: data.level
        }
        await guild_ranks.query().insert(newGuildRankInsert);
        guildInformationLastUpdated = 6;
        return { status: 200, message: 'Guild Rank Created!' };
      } else {
        return { status: 401, message: 'Only guild leader is able to do this action!' }
      }
    } else {
      guildChangeRankNameLastUpdated = moment();
      guildChangeRankNameCheckAcc = validatedAccountID;
      checkSameRank = data.id;
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to create new guild rank at: guildCreateNewRank, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildChangeRankNameLastUpdated = 0;
let guildChangeRankNameCheckAcc = 0;
let checkSameRank = 0;

const guildChangeRankName = async (data, validatedAccountID) => {
  console.log(' o que ta vindo no data de guildChangeRankName?... ', data);

  if (checkSameRank == data.id && guildChangeRankNameCheckAcc == validatedAccountID && moment().diff(guildChangeRankNameLastUpdated, 'minutes') <= 1) {
    return { status: 401, message: 'You have to wait at least 1 minute to do this action again!' }
  }

  if (!data || !data?.update || !data?.update?.name) return { status: 401, message: 'Missing data, check name field and try again!' }

  const nameToCkeck = data?.update?.name;
  const warningText = 'rank name';
  const checkParams = testNameParams(nameToCkeck, 13, 4, warningText, false);
  if (checkParams) return checkParams;

  try {
    data.update.name = formatName(data.update.name);
    guildChangeRankNameLastUpdated = moment();
    guildChangeRankNameCheckAcc = validatedAccountID;
    checkSameRank = data.id;

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    if (getGuildOwnerACC?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You are not this guild leader!' }
    }
    // console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);

    // Estágio 1: Verificando se o jogador tem um personagem na guilda
    const hasMembershipInGuild = getPossiblePlayersFromAccount.some((itemSome) =>
      getPlayerGuildMembership.some((itemSome2) => itemSome2.player_id == itemSome.id)
    );

    if (hasMembershipInGuild) {
      // Estágio 2: Verificando se algum dos personagens do jogador é um líder (nível 3) na guilda
      const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
        const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
        if (playerMembership) {
          const rankInfo = getGuildRanks.find((guildRank) =>
            guildRank.id == playerMembership.rank_id && guildRank.level == 3
          );
          return !!rankInfo; // Retorna true se encontrou um líder
        }
        return false;
      });

      if (hasLeaderRank) {
        console.log('vualá!');
        await guild_ranks.query().update(data.update).where({ id: data.id }).where({ guild_id: getGuildOwnerAndGuildID.id });
        guildInformationLastUpdated = 6;
        return { status: 200, message: 'Guild Rank Name Changed!' };
      } else {
        return { status: 401, message: 'Only guild leader is able to do this action!' }
      }
    } else {
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to change rank name at: guildChangeRankName, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildDeleteRankLastUpdated = 0;
let guildDeleteRankCheckAcc = 0;
let checkDeleteId = 0;

const guildDeleteRank = async (data, validatedAccountID) => {
  console.log('o que ta vindo no delete? ', data);

  if (checkDeleteId == data.rank_id && guildDeleteRankCheckAcc == validatedAccountID && moment().diff(guildDeleteRankLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minutes to do this action again!' }
  }

  try {

    guildDeleteRankLastUpdated = moment();
    guildDeleteRankCheckAcc = validatedAccountID;
    checkDeleteId = data?.rank_id;

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    const getGuildOwnerACC = await players.query().select('account_id').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    if (getGuildOwnerACC?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You are not this guild leader!' }
    }
    // console.log('como esta vindo getPlayerIDToInvite? ', getPlayerIDToInvite);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);

    // Estágio 1: Verificando se o jogador tem um personagem na guilda
    const hasMembershipInGuild = getPossiblePlayersFromAccount.some((itemSome) =>
      getPlayerGuildMembership.some((itemSome2) => itemSome2.player_id == itemSome.id)
    );

    if (hasMembershipInGuild) {
      // Estágio 2: Verificando se algum dos personagens do jogador é um líder (nível 3) na guilda
      const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
        const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
        if (playerMembership) {
          const rankInfo = getGuildRanks.find((guildRank) =>
            guildRank.id == playerMembership.rank_id && guildRank.level == 3
          );
          return !!rankInfo; // Retorna true se encontrou um líder
        }
        return false;
      });

      if (hasLeaderRank) {
        const rankHasPlayer = await guild_membership.query().select('player_id').where({ rank_id: data.rank_id });
        if (rankHasPlayer.length > 0) {
          return { status: 400, message: 'You need to remove all members from this rank first!' }
        }
        console.log('vualá!');
        await guild_ranks.query().delete().where({ id: data.rank_id }).where({ guild_id: getGuildOwnerAndGuildID.id });
        guildInformationLastUpdated = 6;
        return { status: 200, message: 'Guild Rank Deleted!' };
      } else {
        return { status: 401, message: 'Only guild leader is able to do this action!' }
      }
    } else {
      return { status: 401, message: 'You do not have permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to delete guild rank at: guildDeleteRank, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let createNewGuildLastUpdated = 0;
let createNewGuildAccountCheck = 0;

const createNewGuild = async (data, validatedAccountID) => {
  console.log('como ta vindo data de create guild?  ', data);

  if (!data || !data?.insert) {
    return { status: 400, message: 'Missing data to create guild, check fields and try again!' }
  }
  if (!data?.insert?.name) {
    return { status: 400, message: 'You need to pass guild name with at least 4 characteres!' }
  }

  const check = data?.insert?.name;
  const warningText = 'guild name';
  const validateName = testNameParams(check, 16, 5, warningText, false);
  data.insert.name = formatName(data.insert.name);

  if (validateName) return validateName;

  if (validatedAccountID == createNewGuildAccountCheck && moment().diff(createNewGuildLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait 3 minuts before try to create a guild!' }
  }
  try {
    if (!validatedAccountID) {
      return { status: 401, message: 'You dont have permission to access this account!' }
    }

    createNewGuildLastUpdated = moment();
    createNewGuildAccountCheck = validatedAccountID;
console.log('&&&', data.account_id);
    const checkIfHaveCoinsAndTRansferableCoins = await accounts.query().select('project_coins').where({ id: validatedAccountID }).first();
console.log('&&& 2', data.insert.name);
    const checkIfGuildNameExists = await guilds.query().select('name').where({ name: data.insert.name });

    if (checkIfGuildNameExists?.length > 0) {
      return { status: 403, message: 'Guild name already in use!!' }
    }
    if (!checkIfHaveCoinsAndTRansferableCoins || checkIfHaveCoinsAndTRansferableCoins === undefined || checkIfHaveCoinsAndTRansferableCoins === null) {
      return { status: 403, message: 'Some Problem with your account, try log-in again!' }
    }

    // checando se o GuildMaster escolhido está em alguma guild.
    console.log('&&& 3', data);
    
    const getGuildOwnerId = await players.query().select('id').where({ name: data.insert.ownername }).first();
    if (!getGuildOwnerId?.id) {
      return { status: 404, message: 'Guild owner character not found!' }
    }

    const guildOwnerCharacter = await players.query().select('account_id').where({ id: getGuildOwnerId.id }).first();
    if (guildOwnerCharacter?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You can only create guild with characters from your own account!' }
    }

    const checkIfGuildMasterAlreadyIsGuildMember = await guild_membership.query().select('player_id').where({ player_id: getGuildOwnerId.id });
    if (checkIfGuildMasterAlreadyIsGuildMember?.length > 0) {
      return { status: 403, message: 'This character is already in a guild!' }
    }

    const coinsToPay = 10;

    if (Number(checkIfHaveCoinsAndTRansferableCoins.project_coins) >= coinsToPay) {

      const newGuildToInsert = {
        creationdata: data.insert.creationdata,
        level: data.insert.level,
        name: data.insert.name,
        ownerid: getGuildOwnerId.id,
        world_id: data.insert.world_id
      }
      const guildCreated = await guilds.query().insert(newGuildToInsert);
      const getLeaderRankId = await guild_ranks.query().select('id').where({ level: 3 }).where({ name: 'The Leader' }).where({ guild_id: guildCreated.id }).first();
      await guild_membership.query().insert({ player_id: getGuildOwnerId.id, guild_id: guildCreated.id, rank_id: getLeaderRankId.id });
      createNewGuildLastUpdated = moment();
      createNewGuildAccountCheck = validatedAccountID;
      getGuildListLastUpdated = 4;

      await accounts.query().update({
        project_coins: (Number(checkIfHaveCoinsAndTRansferableCoins.project_coins) - coinsToPay),
      }).where({ id: validatedAccountID });

      return { status: 201, message: 'Guild Created!!' }
    } else {
      return { status: 403, message: 'This account does not have enough coins to pay.' }
    }
  } catch (err) {
    console.log('internal error while trying to create guild at: createNewGuild, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let setGuildDescriptionLastUpdated = 0;
let setGuildDescriptionData = 0;

const setGuildDescription = async (data, validatedAccountID) => {

  if (!data || !data?.description) {
    return { status: 400, message: 'Missing data to guild description, check fields and try again!' }
  }
  console.log('Como ta vindo data de setGuildDescription?? ', data);

  if (!data) return { status: 401, message: 'Missing data, check description field and try again!' }

  const nameToCkeck = data?.description;
  const warningText = 'guild description';
  const checkParams = testNameParams(nameToCkeck, 255, 10, warningText, false, true);
  if (checkParams) return checkParams;

  if (setGuildDescriptionData == data?.guild_name && moment().diff(setGuildDescriptionLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait at least 3 minuts to retry!' }
  }

  try {
    setGuildDescriptionLastUpdated = moment();
    setGuildDescriptionData = data.guild_name;

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    const getGuildOwnerACC = await players.query().select('account_id', 'name').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    if (getGuildOwnerACC?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You are not this guild leader!' }
    }

    // console.log('como esta vindo getPlayerID? ', getPlayerID);
    // console.log('como esta vindo getGuildOwnerID? ', getGuildOwnerAndGuildID);
    // console.log('como esta vindo getGuildOwnerACC? ', getGuildOwnerACC);

    if (getGuildOwnerACC.account_id !== validatedAccountID) {
      return { status: 401, message: 'You do not have permission in this guild!' }
    }

    const getPossiblePlayersFromAccount = await players.query().select('id').where({ account_id: validatedAccountID });
    // console.log('possible accounts check = ', getPossiblePlayersFromAccount);

    const getPlayerGuildMembership = await guild_membership.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo info de getPlayerGuildMembership? ', getPlayerGuildMembership);
    const getGuildRanks = await guild_ranks.query().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });

    // console.log('como ta vindo ranks da guilda? ', getGuildRanks);

    const hasLeaderRank = getPossiblePlayersFromAccount.some((player) => {
      const playerMembership = getPlayerGuildMembership.find((member) => member.player_id == player.id);
      if (playerMembership) {
        const rankInfo = getGuildRanks.find((guildRank) =>
          guildRank.id == playerMembership.rank_id && (guildRank.level == 3));
        return !!rankInfo; // Retorna true se encontrou um líder
      }
      return false;
    });

    if (hasLeaderRank) {
      await guilds.query().update({ motd: data?.description }).where({ id: getGuildOwnerAndGuildID.id });
      getGuildListLastUpdated = 4;
      return { status: 200, message: 'Guild description updated successfully!' };
    } else {
      return { status: 401, message: 'You have no permissions in this guild!' }
    }
  } catch (err) {
    console.log('internal error while trying to remove character from Guild at: characterToRemoveFromGuild, ', err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let guildLogoCheckDBLastUpdated = 0;
let guildLogoCheckDBCheckAcc = 0;

const guildLogoCheckDB = async (data, validatedAccountID) => {
  if (!data || !data.guild_name) {
    return { status: 400, message: 'Missing data at request!' }
  }
  if (guildLogoCheckDBCheckAcc == validatedAccountID && moment().diff(guildLogoCheckDBLastUpdated, 'minutes') <= 3) {
    return { status: 401, message: 'You have to wait 3 minutes to try again!' }
  }

  try {
    guildLogoCheckDBLastUpdated = moment();
    guildLogoCheckDBCheckAcc = validatedAccountID;

    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    if (!getGuildOwnerAndGuildID?.id) {
      return { status: 404, message: 'Guild not found!' }
    }
    const getGuildOwnerACC = await players.query().select('account_id', 'name').where({ id: getGuildOwnerAndGuildID.ownerid }).first();
    if (getGuildOwnerACC?.account_id !== validatedAccountID) {
      return { status: 401, message: 'You are not this guild leader!' }
    }
    return { status: 200, message: 'Ok!' }
  } catch (err) {
    console.log('error at guildLogoCheckDB, ', err);
    return { status: 500, message: 'Server-side error!' }
  }
}

const updateGuildLogoDB = async (data) => {
  console.log('essa é a data', data)
  if (!data || !data.guild_name || !data?.file) {
    return { status: 400, message: 'Missing data at request!' }
  }

  try {
    guildInformationData = null;
    const getGuildOwnerAndGuildID = await guilds.query().select('id', 'ownerid').where({ name: data.guild_name }).first();
    if (!getGuildOwnerAndGuildID?.id) {
      return { status: 404, message: 'Guild not found!' }
    }

    const getGuildLogo = await guild_logos().select('*').where({ guild_id: getGuildOwnerAndGuildID.id });
    console.log('ja tem logo ', getGuildLogo);

    if(getGuildLogo < 1) {
      await guild_logos().insert({ guild_id: getGuildOwnerAndGuildID.id, logo_url: data.file.filename }).where({ guild_id: getGuildOwnerAndGuildID.id });
      return { status: 200, message: 'Guild logo updated!' }
    }
    const logoName = getGuildLogo[0]?.logo_url;
    const oldLogoPath = path.join(__dirname, '..', 'resources', 'guild-logos', 'compressed', logoName);

    // deleta logo antigo
    fs.unlinkSync(oldLogoPath);
    
    await guild_logos().update({ logo_url: data.file.filename }).where({ guild_id: getGuildOwnerAndGuildID.id });
    return { status: 200, message: 'Guild logo updated!' }
  } catch (err) {
    console.log('error at guildLogoCheckDB, ', err);
    return { status: 500, message: 'Server-side error!' }
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
  createNewGuild,
  setGuildDescription,
  guildLogoCheckDB,
  updateGuildLogoDB
}