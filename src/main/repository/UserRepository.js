const { accounts, players, players_online, player_deaths, player_items,
  players_comment, players_titles, guild_membership, guilds, guild_ranks } = require('../models/projectModels');
const { convertPremiumTimeToDaysLeft, updateLastDayTimeStampEpochFromGivenDays } = require('../utils/utilities');

module.exports = app => {
  const moment = require('moment');

  const updateAcc = async (data) => {
    const findAccountFirst = await accounts.query().select('id').where({ id: data.id });
    if (findAccountFirst.length < 1) {
      return { status: 500, message: 'Internal error on trying update your account, account not found, open a ticket or call admin!' }
    }
    try {
      await accounts.query().update(data.update).where({ id: data.id });
      return { status: 200, message: 'Account updated successfully!' };
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Something went wrong, call administration or open a ticket!' }
    }
  }

  const InsertNewAccount = async (data) => {
    const checkIfExistEmailFirst = await accounts.query().select('email').where({ email: data.email });
    const checkIfExistNameFirst = await accounts.query().select('email').whereRaw('LOWER(name) = ?', data.name.toLowerCase());

    if (checkIfExistNameFirst.length > 0) {
      return { status: 404, message: 'Account name already in use!' }
    }

    if (checkIfExistEmailFirst.length > 0) {
      return { status: 404, message: 'Email already in use!' }
    }
    try {
      data.createdAt = Math.floor(Date.now() / 1000);
      data.coins = 1500;
      const resp = await accounts.query().insert(data);
      const { id, ...rests } = resp;
      return { status: 201, message: id };
    } catch (err) {
      console.log(err)
      return { status: 500, message: err }
    }
  }

  const checkIfAccExists = async (data) => {
    try {
      const exists = await accounts.query().select('email', 'id', 'password', 'name', 'loginHash', 'country', 'coins').where({ email: data });
      if (!exists || exists === undefined || exists?.length < 1) {
        return { bool: false };
      } else {
        return { acc: exists, bool: true };
      }
    } catch (err) {
      console.log('erro ao tentar validar account em checkIfExists userRepository...', err)
    }
  }

  const validateLoginHash = async (data) => {
    console.log(data)
    try {
      if (!data?.loginHash || !data.id) { return { status: 403, message: 'You need to Login!' } }

      const validHash = await accounts.query().select('loginHash').where({ id: data.id }).first();

      if (!validHash || validHash === undefined) { return { status: 403, message: 'error at login hash' } }

      if (validHash.loginHash.trim() !== data?.loginHash.trim()) {
        return {
          status: 403, message: `close this page, re-open the website, and try again! or call admin!`
        }
      };

      const acc = await accounts.query().select('id', 'name', 'email', 'country', 'lastday', 'coins', 'isBanned',
        'banReason', 'premdays', 'createdAt', 'day_end_premmy', 'web_lastlogin', 'web_flags', 'type')
        .where({ id: Number(data.id) }).first();

      if (Number(acc.premdays) > 0) {

        if (acc.day_end_premmy !== 0 && acc.premdays > 0) {

          const dataToUpdatePremDays = {
            id: acc.id,
            update: {
              premdays: convertPremiumTimeToDaysLeft((Number(acc.day_end_premmy) + 4640))
            }
          }
          await updateAcc(dataToUpdatePremDays);
        }

        const accToUpdate = await accounts.query().select('*').where({ id: Number(data.id) }).first();

        if (Number(Date.now()) > (Number(accToUpdate.day_end_premmy) * 1000) || Number(accToUpdate.day_end_premmy) == 0 || Number(accToUpdate.premdays) > Number(convertPremiumTimeToDaysLeft((Number(accToUpdate.day_end_premmy) + (29 * 86400))))) {

          let daysDifference = null;
          if (Number(acc.day_end_premmy) !== 0) {
            daysDifference = (Number(accToUpdate.premdays) - Number(convertPremiumTimeToDaysLeft(Number(accToUpdate.day_end_premmy))));
          }

          const updatedLastDays = (updateLastDayTimeStampEpochFromGivenDays(Number(accToUpdate.day_end_premmy) !== 0 ? daysDifference : accToUpdate.premdays, Number(accToUpdate.day_end_premmy)));

          const dataToUpdateLastDay = {
            id: accToUpdate.id,
            update: {
              day_end_premmy: updatedLastDays,
            }
          }
          await updateAcc(dataToUpdateLastDay);
        }
      }

      const characters = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .join('vocations', 'players.vocation', 'vocations.vocation_id')
        .select('players.id', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName as world', 'players.createdAt', 'group_id', 'players.hidden')
        .where({ account_id: Number(data.id) })
        .where({ 'players.deletedAt': 0 }).orderBy('players.name', 'asc');

      const editedCharList = [];

      for (x in characters) {
        const deathList = await player_deaths.query().select('*').where({ player_id: characters[x].id });
        const online = await players_online.query().select('*').where({ player_id: characters[x].id });
        const comment = await players_comment.query().select('comment').where({ player_id: characters[x].id }).first();

        deathList.sort((a, b) => b.time - a.time);

        deathList.slice(0, 15);

        const newCharInfo = {
          ...characters[x],
          deathList,
          comment: comment?.comment,
          isOnline: online[0]?.player_id ? true : false,
        }
        editedCharList.push(newCharInfo);
      }
      const accUpdatedPremiumTime = await accounts.query().select('id', 'name', 'email', 'country', 'lastday', 'coins',
        'isBanned', 'banReason', 'premdays', 'createdAt', 'day_end_premmy', 'web_lastlogin', 'web_flags', 'type')
        .where({ id: Number(data.id) }).first();
      const accInfo = {
        ...accUpdatedPremiumTime,
        editedCharList,
      }

      return { status: 200, message: accInfo };
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error' };
    }
  }

  const createNewCharacterDB = async (data) => {
    console.log('informações enviadas na criação do personagem no back: ', data)
    data.createdAt = Math.floor(Date.now() / 1000);
    try {
      const checkNameExist = await players.query().select('name').whereRaw('LOWER(name) = ?', data.name.toLowerCase());
      const femaleCharacter = {
        ...data,
        looktype: 136
      }
      data.name = data.name.charAt(0).toUpperCase() + data.name.slice(1);
      if (!checkNameExist || checkNameExist === undefined || checkNameExist?.length < 1) {
        await players.query().insert(data.sex === 0 ? femaleCharacter : data);
        const getCreatedPlayer = await players.query().select('id').where({ name: data.name }).first();

        const newComersIinitialItens = [
          { player_id: Number(getCreatedPlayer.id), pid: 3, sid: 101, itemtype: 2853, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 4, sid: 102, itemtype: 3561, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 104, itemtype: 3291, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 105, itemtype: 3270, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 106, itemtype: 3293, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 107, itemtype: 21401, count: 1 },
          { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 108, itemtype: 3585, count: 1 }
        ]
        newComersIinitialItens.map(async (each) => {
          await player_items.query().insert(each);
        })
        return { status: 201, message: 'Created successfuly' }
      } else {
        return { status: 400, message: 'Name already in use!' };
      }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error, call administrator!' }
    }
  }

  const checkCharacterOwnerAtDB = async (data) => {
    data.name = data.name.replaceAll('-', ' ');
    console.log(data.name)
    console.log('qual a dataaa???????????????????????? ', data.name)
    const checkOnlyPlayerNameFirst = await players.query().select('name', 'account_id').where({ name: data.name });

    if (checkOnlyPlayerNameFirst.length < 1) { return { status: 404, message: 'Character does not exists!' } }
    let checkCharacterOwner = null;
    try {
      checkCharacterOwner = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .join('vocations', 'players.vocation', 'vocations.vocation_id')
        .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName as world', 'worlds.id as world_id', 'players.createdAt', 'group_id', 'players.hidden')
        .where({ name: data.name })
        .where({ account_id: data.account_id })
        .where({ 'players.deletedAt': 0 }).first();
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!s' }
    }
    if (checkCharacterOwner === undefined || checkCharacterOwner === null) {
      try {
        console.log('qual o nome dessa mierda? ', data.name.toLowerCase())
        const found = await players.query()
          .join('worlds', 'players.world_id', '=', 'worlds.id')
          .join('vocations', 'players.vocation', 'vocations.vocation_id')
          .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName as world', 'worlds.id as world_id', 'players.createdAt', 'group_id')
          .whereRaw('LOWER(players.name) = ?', data.name.toLowerCase())
          .where({ 'players.deletedAt': 0 }).first();
        const deathList = await player_deaths.query()
          .select('*')
          .where({ player_id: found.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: found.id }).first();
        const comment = await players_comment.query().select('comment').where({ player_id: found.id }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: found.account_id });
        const guild = await guild_membership.query().select('player_id', 'guild_id', 'rank_id').where({ player_id: found.id }).first();
        const memberRank = guild ? (await guild_ranks.query().select('name').where({ id: guild.rank_id }).first()) : '';
        const GuildName = guild ? (await guilds.query().select('name', 'id').where({ id: guild.guild_id }).first()) : '';
        console.log('wetf guild_id???', GuildName)
        const characterOwnershipFalse = {
          ...found,
          deathList,
          owner: false,
          accountCharList: found.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false,
          guild: GuildName.name,
          guild_rank: memberRank.name,
          guild_id: GuildName.id
        }
        return { status: 200, message: characterOwnershipFalse, owner: false }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!a' }
      }
    } else {
      try {
        const deathList = await player_deaths.query()
          .select('*')
          .where({ player_id: checkCharacterOwner.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: checkCharacterOwner.id }).first();
        const comment = await players_comment.query().select('comment').where({ player_id: checkCharacterOwner.id }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: checkCharacterOwner.account_id });
        const guild = await guild_membership.query().select('player_id', 'guild_id', 'rank_id').where({ player_id: checkCharacterOwner.id }).first();
        const memberRank = guild ? (await guild_ranks.query().select('name').where({ id: guild.rank_id }).first()) : '';
        const GuildName = guild ? (await guilds.query().select('name', 'id').where({ id: guild.guild_id }).first()) : '';
        console.log('wetf guild_id???', GuildName)
        const characterOwnershipTrue = {
          ...checkCharacterOwner,
          deathList,
          owner: true,
          accountCharList: checkCharacterOwner.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false,
          guild: GuildName.name,
          guild_rank: memberRank.name,
          guild_id: GuildName.id
        }
        return { status: 200, message: characterOwnershipTrue }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!' }
      }
    }
  };

  // Sistema de cash para highScores
  let experienceLastUpdated = 0;
  let experiencePlayers = 0;

  let skillFistLastUpdated = 0;
  let skillFistPlayers = 0;

  let skillAxeLastUpdated = 0;
  let skillAxePlayers = 0;

  let skillSwordLastUpdated = 0;
  let skillSwordPlayers = 0;

  let skillClubLastUpdated = 0;
  let skillClubPlayers = 0;

  let skillDistLastUpdated = 0;
  let skillDistPlayers = 0;

  let skillMlvlLastUpdated = 0;
  let skillMlvlPlayers = 0;

  let skillShieldingLastUpdated = 0;
  let skillShieldingPlayers = 0;

  let skillFishingLastUpdated = 0;
  let skillFishingPlayers = 0;

  const getlAllPlayersToHighscoreRepository = async (data) => {
    console.log('.................: ', data)
    // Sistema de cash para highScores
    if (data == 'experience' && moment().diff(experienceLastUpdated, 'minutes') < 5) {
      console.log('Cache experienceSkill aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(experiencePlayers) }
    }
    else if (data == 'skill_fist' && moment().diff(skillFistLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_fist aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillFistPlayers) }
    }
    else if (data == 'skill_axe' && moment().diff(skillAxeLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_axe aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillAxePlayers) }
    }
    else if (data == 'skill_sword' && moment().diff(skillSwordLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_sword aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillSwordPlayers) }
    }
    else if (data == 'skill_club' && moment().diff(skillClubLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_club aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillClubPlayers) }
    }
    else if (data == 'skill_dist' && moment().diff(skillDistLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_dist aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillDistPlayers) }
    }
    else if (data == 'maglevel' && moment().diff(skillMlvlLastUpdated, 'minutes') < 5) {
      console.log('Cache maglevel aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillMlvlPlayers) }
    }
    else if (data == 'skill_shielding' && moment().diff(skillShieldingLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_shielding aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillShieldingPlayers) }
    }
    else if (data == 'skill_fishing' && moment().diff(skillFishingLastUpdated, 'minutes') < 5) {
      console.log('Cache skill_fishing aplicado com sucesso!')
      return { status: 200, message: JSON.stringify(skillFishingPlayers) }
    }

    try {
      const highScores = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .join('vocations', 'players.vocation', 'vocations.vocation_id')
        .join('accounts', 'players.account_id', '=', 'accounts.id')
        .select('players.id', 'players.name', 'players.level', 'vocation_name as vocation', 'worlds.serverName as world',
          'players.hidden', 'accounts.country', 'players.skill_fist', 'players.skill_club', 'players.skill_sword',
          'players.skill_axe', 'players.skill_dist', 'players.skill_shielding',
          'players.skill_fishing', 'players.experience', 'players.maglevel')
        .where('players.group_id', '<', 6)
        .where({ 'players.deletedAt': 0 })
        .orderBy(data, 'desc')
        .limit(100);

      switch (data) {
        case 'experience':
          experienceLastUpdated = moment();
          experiencePlayers = highScores;
          return { status: 200, message: JSON.stringify(experiencePlayers) }

        case 'skill_fist':
          skillFistLastUpdated = moment();
          skillFistPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillFistPlayers) }

        case 'skill_axe':
          skillAxeLastUpdated = moment();
          skillAxePlayers = highScores;
          return { status: 200, message: JSON.stringify(skillAxePlayers) }

        case 'skill_sword':
          skillSwordLastUpdated = moment();
          skillSwordPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillSwordPlayers) }

        case 'skill_club':
          skillClubLastUpdated = moment();
          skillClubPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillClubPlayers) }

        case 'skill_dist':
          skillDistLastUpdated = moment();
          skillDistPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillDistPlayers) }
        case 'maglevel':
          skillMlvlLastUpdated = moment();
          skillMlvlPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillMlvlPlayers) }

        case 'skill_shielding':
          skillShieldingLastUpdated = moment();
          skillShieldingPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillShieldingPlayers) }

        case 'skill_fishing':
          skillFishingLastUpdated = moment();
          skillFishingPlayers = highScores;
          return { status: 200, message: JSON.stringify(skillFishingPlayers) }

        default:
          console.log('Error while trying to retrieve highScores')
          return { status: 500, message: JSON.stringify('Internal error') }
      }

    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error while trying to retrieve highScores' }
    }
  }

  const getCharacterTitlesRepo = async (data) => {
    console.log('player title player id.....: ', data)
    try {
      if (data.trigger === 'getTitle') {
        const title = await players_titles.query().select('*').where({ player_id: data.id }).where({ in_use: 1 }).first();
        return { status: 200, message: title }
      } else {
        const titles = await players_titles.query().select('*').where({ player_id: data.id });
        return { status: 200, message: titles }
      }
    } catch (err) {
      console.log('Error trying get titles at: getCharacterTitlesRepo, ', err)
      return { status: 500, message: 'Internal errror' }
    }
  }

  const updateCharacterTitleInUseRepo = async (data) => {
    try {
      await players_titles.query().update({ in_use: 0 }).where({ player_id: data.player_id }).whereNot('id', data.title_id);

      await players_titles.query().update({ in_use: 1 }).where({ id: data.title_id });
      return { status: 200, message: 'Title Updated!' }
    } catch (err) {
      console.log('Error trying update titles at: updateCharacterTitleInUseRepo, ', err)
      return { status: 500, message: 'Internal errror' }
    }
  }



  return {
    checkIfAccExists,
    InsertNewAccount,
    updateAcc,
    validateLoginHash,
    createNewCharacterDB,
    checkCharacterOwnerAtDB,
    getlAllPlayersToHighscoreRepository,
    getCharacterTitlesRepo,
    updateCharacterTitleInUseRepo
  }
}