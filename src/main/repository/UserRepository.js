require('dotenv');
const { accounts, players, players_online, player_deaths, guild_invites,
  players_titles, guild_membership, guilds, guild_ranks } = require('../models/MasterModels');

const { convertPremiumTimeToDaysLeft, updateLastDayTimeStampEpochFromGivenDays, setCreateCharacterController,
  getCreateCharacterController, ErrorLogCreateFileHandler, formatName, vocationsArr, testNameParams } = require('../utils/utilities');
module.exports = app => {
  const moment = require('moment');

  let checkIfAccExistsData = 0;
  let checkIfAccExistsLastUpdated = 0;
  let checkAcc = 0;
  let accountsCreatedAtColumn = null;

  const resolveAccountsCreatedAtColumn = async () => {
    if (accountsCreatedAtColumn) return accountsCreatedAtColumn;

    const columnsInfo = await accounts.query().columnInfo();

    if (columnsInfo?.created_at) {
      accountsCreatedAtColumn = 'created_at';
      return accountsCreatedAtColumn;
    }

    if (columnsInfo?.createdAt) {
      accountsCreatedAtColumn = 'createdAt';
      return accountsCreatedAtColumn;
    }

    return null;
  };

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
      const dataToInsert = { ...data };
      const createdAtColumn = await resolveAccountsCreatedAtColumn();

      if (createdAtColumn) {
        dataToInsert[createdAtColumn] = Math.floor(Date.now() / 1000);
      }

      const resp = await accounts.query().insert(dataToInsert);
      const { id, ...rests } = resp;
      checkIfAccExistsData = 0;
      return { status: 201, message: id };
    } catch (err) {
      console.log(err)
      return { status: 500, message: err }
    }
  }

  const checkIfAccExists = async (data) => {
    console.log('....................................................!!!!!!!!!!!!!!!: ', data)
    console.log('....................................................!!!!!!!!!!!!!!!: ', checkIfAccExistsData, data)
    console.log('vai entrar no chache?')
    if (checkIfAccExistsData.toString() === data.toString() && moment().diff(checkIfAccExistsLastUpdated, 'minutes') < 5) {
      console.log('Entrou no chache?')
      console.log('Cache checkAcc aplicado com sucesso!')

      if (!checkAcc || checkAcc === undefined || checkAcc?.length < 1) {
        return { bool: false };
      } else {
        return { acc: checkAcc, bool: true };
      }
    }

    try {
      checkAcc = await accounts.query().select('email', 'id', 'password', 'name', 'login_hash', 'country', 'project_coins').where({ email: data });
      if (!checkAcc || checkAcc === undefined || checkAcc?.length < 1) {
        checkIfAccExistsLastUpdated = moment();
        checkIfAccExistsData = data;
        return { bool: false };
      } else {
        checkIfAccExistsLastUpdated = moment();
        checkIfAccExistsData = data;
        return { acc: checkAcc, bool: true };
      }
    } catch (err) {
      console.log('erro ao tentar validar account em checkIfExists userRepository...', err)
    }
  }

  let validateLoginData = 0;
  let validateLoginLastUpdated = 0;
  let validateLoginAccInfo = 0;

  const validateLoginHash = async (data) => {
    // cache

    if (validateLoginData.id == data.id && getCreateCharacterController() !== 0 && moment().diff(validateLoginLastUpdated, 'minutes') < 5) {
      console.log('Cache validateLoginAccMannagement aplicado com sucesso!')

      return { status: 200, message: validateLoginAccInfo };
    }

    try {
      console.log('NÃO ENTROU NO CASH!')
      const incomingLoginHash = data?.login_hash || data?.loginHash;
      if (!incomingLoginHash || !data.id) { return { status: 403, message: 'You need to Login!' } }

      const validateLoginInfo = await accounts.query().select('login_hash').where({ id: Number(data.id) }).first();

      if (!validateLoginInfo || validateLoginInfo === undefined) { return { status: 403, message: 'error at login hash' } }

      if (validateLoginInfo.login_hash?.trim() !== incomingLoginHash?.trim()) {
        return {
          status: 403, message: `Error at Login hash, close this page, re-open the website, and try again! or call admin!`
        }
      };

      const characters = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .select('players.id', 'players.name', 'players.level', 'sex', 'lastlogin', 'lastip', 'worlds.server_name as world', 'players.created_at', 'group_id', 'players.hidden', 'players.comment')
        .select(players.raw('CASE players.vocation ' + vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ') + ' END as vocation'))
        .where({ 'players.account_id': Number(data.id) })
        .where({ 'players.deletion': 0 })
        .orderBy('players.name', 'asc');

      const editedCharList = [];

      for (x in characters) {
        const deathList = await player_deaths.query().select('time', 'level', 'killed_by', 'is_player', 'mostdamage_by', 'mostdamage_is_player', 'unjustified', 'mostdamage_unjustified').where({ player_id: characters[x].id });

        const online = await players_online.query().select('*').where({ player_id: characters[x].id });

        const playerGuildID = await guild_membership.query().select('guild_id').where({ player_id: characters[x].id });

        const playerGuildInvite = await guild_invites.query().select('guild_id').where({ player_id: characters[x].id });

        let playerGuildName = null;
        let playerAccepGuildInvit = null;

        if (playerGuildID.length > 0) {
          playerGuildName = await guilds.query().select('name').where({ id: playerGuildID[0]?.guild_id }).first();
        }
        if (playerGuildInvite.length > 0) {
          playerAccepGuildInvit = await guilds.query().select('name').where({ id: playerGuildInvite[0]?.guild_id }).first();
        }

        deathList.sort((a, b) => b.time - a.time);

        deathList.slice(0, 15);
        delete characters[x].id;
        const newCharInfo = {
          ...characters[x],
          deathList,
          isOnline: online[0]?.player_id ? true : false,
          guild_name: playerGuildName?.name,
          guild_invite_name: playerAccepGuildInvit?.name
        }
        editedCharList.push(newCharInfo);
      }
      const createdAtColumn = await resolveAccountsCreatedAtColumn();
      const accSelectColumns = ['name', 'premdays', 'email', 'country', 'lastday', 'project_coins', 'web_lastlogin', 'web_flags', 'type'];

      if (createdAtColumn === 'created_at') {
        accSelectColumns.push('created_at');
      } else if (createdAtColumn === 'createdAt') {
        accSelectColumns.push('createdAt as created_at');
      }

      const accUpdatedPremiumTime = await accounts.query().select(...accSelectColumns)
        .where({ id: Number(data.id) }).first();

      if (accUpdatedPremiumTime?.created_at === undefined || accUpdatedPremiumTime?.created_at === null) {
        accUpdatedPremiumTime.created_at = 0;
      }

      accUpdatedPremiumTime.premdays = (accUpdatedPremiumTime.lastday - (Date.now() / 1000)) > 0 ? Math.floor(((accUpdatedPremiumTime.lastday - (Date.now() / 1000)) / 60 / 60 / 24)) : 0;
      validateLoginAccInfo = {
        ...accUpdatedPremiumTime,
        editedCharList,
      }

      validateLoginLastUpdated = moment();
      validateLoginData = data;
      setCreateCharacterController(1);
      return { status: 200, message: validateLoginAccInfo };
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error' };
    }
  }

  let createNewCharacterDBLastUpdated = 0;
  let createNewCharacterDBData = '';
  let createNewCharacterDBUserValidation = 0;
  const createNewCharacterDB = async (data, isValidToken) => {

    if (process.env.TESTSERVER_ON == 'true') {
      return { status: 401, message: 'Create character is bloked right now, check news or discord news!' };
    }

    if (createNewCharacterDBData?.toLowerCase() == data.name.toLowerCase() && createNewCharacterDBUserValidation == isValidToken?.data?.id && moment().diff(createNewCharacterDBLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait 3 minuts to try again!' }
    }

    const nameToCheck = data.name;
    const warningTextName = 'character name';
    const checkingNameParams = testNameParams(nameToCheck, 22, 5, warningTextName, false, false);
    if (checkingNameParams) return checkingNameParams;

    try {
      const checkPlayersQuantity = await players.query().select('name').where({ account_id: data?.account_id ? data?.account_id : 0, deletion: 0 });
      console.log('LOGANDO QUANTIDADE DE PLAYERS NA CONTA... ', checkPlayersQuantity.length);
      if (checkPlayersQuantity.length >= 20) {
        return { status: 401, message: 'Max character limit 20 per account!' };
      }

      const checkNameExist = await players.query().select('name').whereRaw('LOWER(name) = ?', data.name.toLowerCase());

      const normalizedSex =
        data.sex === 1 ||
        data.sex === '1' ||
        data.sex === 'male' ||
        data.sex === 'Male'
          ? 1
          : 0;

      const characterToCreate = {
        ...data,
        name: formatName(data.name),
        sex: normalizedSex,
        looktype: normalizedSex === 1 ? 128 : 136,
        conditions: Buffer.alloc(0),
        created_at: Math.floor(Date.now() / 1000)
      };

      data.name = characterToCreate.name;
      if (!checkNameExist || checkNameExist === undefined || checkNameExist?.length < 1) {
        await players.query().insert(characterToCreate);
        const getCreatedPlayer = await players.query().select('id').where({ name: data.name, deletion: 0 }).first();

        // const newComersIinitialItens = [
        //   { player_id: Number(getCreatedPlayer.id), pid: 3, sid: 101, itemtype: 2853, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 4, sid: 102, itemtype: 3561, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 104, itemtype: 3291, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 105, itemtype: 3270, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 106, itemtype: 3293, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 107, itemtype: 21401, count: 1 },
        //   { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 108, itemtype: 3585, count: 1 }
        // ]
        // newComersIinitialItens.map(async (each) => {
        //   await player_items.query().insert(each);
        // })

        setCreateCharacterController(0);
        createNewCharacterDBLastUpdated = moment();
        createNewCharacterDBData = data.name;
        createNewCharacterDBUserValidation = isValidToken?.data?.id;
        return { status: 201, message: 'Created successfuly' }
      } else {
        createNewCharacterDBLastUpdated = moment();
        createNewCharacterDBData = data.name;
        createNewCharacterDBUserValidation = isValidToken?.data?.id;
        return { status: 400, message: 'Name already in use!' };
      }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error, call administrator!' }
    }
  }

  let checkPlayerNameInfo = 0;
  let PlayerInfoLastUpdated = 0;
  let PlayerData = 0;
  let PlayerInfo = 0;

  const checkCharacterOwnerAtDB = async (data) => {
    data.name = data.name.replaceAll('-', ' ');
    console.log(data.name)
    console.log('qual a dataaa???????????????????????? ', data.name)
    //cache
    console.log('VAI ENTRAR NO CACHE DE GetPlayerInfo??', PlayerData.name, data.name);
    if (PlayerData.name === data.name && moment().diff(PlayerInfoLastUpdated, 'minutes') < 5) {
      console.log('ENTROU NO CACHE!!')
      console.log('CACHE em GetPlayerInfo feito com sucesso!!');
      if (checkPlayerNameInfo.length < 1) { return { status: 404, message: 'Character does not exists!' } }

      if (PlayerInfo && PlayerInfo?.owner == false) {
        return { status: 200, message: PlayerInfo, owner: false }
      }
      return { status: 200, message: PlayerInfo, owner: true }
    }

    checkPlayerNameInfo = await players.query().select('name', 'account_id').where({ name: data.name, deletion: 0 });

    if (checkPlayerNameInfo.length < 1) {
      PlayerInfoLastUpdated = moment();
      return { status: 404, message: 'Character does not exists!' }
    }

    let checkCharacterOwner = null;

    try {
      console.log('NÃO ENTROU NO CASH!!')
      PlayerData = data;

      checkCharacterOwner = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'sex', 'lastlogin', 'lastip', 'worlds.server_name as world', 'worlds.id as world_id', 'players.created_at', 'group_id', 'players.hidden')
        .select(players.raw('CASE players.vocation ' + vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ') + ' END as vocation'))
        .where({ name: data.name })
        .where({ account_id: data.account_id })
        .where({ 'players.deletion': 0 }).first();
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!s' }
    }
    if (checkCharacterOwner === undefined || checkCharacterOwner === null) {
      try {

        const found = await players.query()
          .join('worlds', 'players.world_id', '=', 'worlds.id')
          .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'sex', 'lastlogin', 'lastip', 'worlds.server_name as world', 'worlds.id as world_id', 'players.created_at', 'group_id')
          .select(players.raw('CASE players.vocation ' + vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ') + ' END as vocation'))
          .whereRaw('LOWER(players.name) = ?', data.name.toLowerCase())
          .where({ 'players.deletion': 0 }).first();
        const deathList = await player_deaths.query()
          .select('time', 'level', 'killed_by', 'is_player', 'mostdamage_by', 'mostdamage_is_player', 'unjustified', 'mostdamage_unjustified')
          .where({ player_id: found.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: found.id }).first();
        const comment = await players.query().select('comment').where({ id: found.id, deletion: 0 }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: found.account_id, deletion: 0 });
        const guild = await guild_membership.query().select('player_id', 'guild_id', 'rank_id').where({ player_id: found.id }).first();
        const memberRank = guild ? (await guild_ranks.query().select('name').where({ id: guild.rank_id }).first()) : '';
        const GuildName = guild ? (await guilds.query().select('name', 'id').where({ id: guild.guild_id }).first()) : '';
        console.log('wetf guild_id???', GuildName);
        delete found.id;
        delete found.account_id;
        delete found.lastip;

        PlayerInfo = {
          ...found,
          deathList,
          owner: false,
          accountCharList: found.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false,
          guild: GuildName.name,
          guild_rank: memberRank.name,
        }
        PlayerInfoLastUpdated = moment();
        return { status: 200, message: PlayerInfo, owner: false }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!a' }
      }
    } else {
      try {
        const deathList = await player_deaths.query()
          .select('time', 'level', 'killed_by', 'is_player', 'mostdamage_by', 'mostdamage_is_player', 'unjustified', 'mostdamage_unjustified')
          .where({ player_id: checkCharacterOwner.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: checkCharacterOwner.id }).first();
        const comment = await players.query().select('comment').where({ id: checkCharacterOwner.id, deletion: 0 }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: checkCharacterOwner.account_id, deletion: 0 });
        const guild = await guild_membership.query().select('player_id', 'guild_id', 'rank_id').where({ player_id: checkCharacterOwner.id }).first();
        const memberRank = guild ? (await guild_ranks.query().select('name').where({ id: guild.rank_id }).first()) : '';
        const GuildName = guild ? (await guilds.query().select('name', 'id').where({ id: guild.guild_id }).first()) : '';
        delete checkCharacterOwner.id;
        delete checkCharacterOwner.account_id;
        delete checkCharacterOwner.lastip;

        PlayerInfo = {
          ...checkCharacterOwner,
          deathList,
          owner: true,
          accountCharList: checkCharacterOwner.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false,
          guild: GuildName.name,
          guild_rank: memberRank.name,
        }
        PlayerInfoLastUpdated = moment();
        return { status: 200, message: PlayerInfo, owner: true }
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
        .join('accounts', 'players.account_id', '=', 'accounts.id')
        .select('players.name', 'players.level', 'worlds.server_name as world',
          'players.hidden', 'accounts.country', 'players.skill_fist', 'players.skill_club', 'players.skill_sword',
          'players.skill_axe', 'players.skill_dist', 'players.skill_shielding',
          'players.skill_fishing', 'players.experience', 'players.maglevel')
        .select(players.raw('CASE players.vocation ' + vocationsArr.map((vocation) => `WHEN ${vocation.vocation_id} THEN '${vocation.vocation_name}'`).join(' ') + ' END as vocation'))
        .where('players.group_id', '=', 1)
        .where({ 'players.deletion': 0 })
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
      console.log(err);
      const warningTxt = 'Erro gerado ao tentar pegar highscores em userrepository na function getlAllPlayersToHighscoreRepository';
      ErrorLogCreateFileHandler('error-GetHighScorePlayersFunction.txt', warningTxt, err);
      return { status: 500, message: 'Internal error while trying to retrieve highScores' }
    }
  }

  let getTitleLastUpdated = 0;
  let getTitleSLastUpdated = 0;
  let getTitlesInfo = 0;
  let getTitleInfo = 0;
  let getTitleData = 0;

  const getCharacterTitlesRepo = async (data) => {
    console.log('VAI ENTRAR NO CACHE GETTITLE???? ', data)
    try {
      //cache
      if (getTitleData?.name === data?.name && data?.trigger === 'getTitle' && moment().diff(getTitleLastUpdated, 'minutes') < 5) {
        console.log('ENTROU NO CASH!!!');
        console.log('CACHE EM GETTITLE FEITO COM SUCESSO!!!');
        return { status: 200, message: getTitleInfo }
      }
      if (getTitleData?.name === data?.name && moment().diff(getTitleSLastUpdated, 'minutes') < 5) {
        console.log('ENTROU NO CASH!!!');
        console.log('CACHE EM GETTITLES FEITO COM SUCESSO!!!');
        return { status: 200, message: getTitlesInfo }
      }

      console.log('NÃO ENTROU NO CASH!!!');
      getTitleData = data;
      console.log('qual foi? ', data.trigger)
      console.log('qual é?? ', data)
      if (data.trigger === 'getTitle') {
        getTitleInfo = await players.query()
          .join('titles', 'players.title', '=', 'titles.id')
          .select('titles.title_name', 'players.deletion')
          .where({ 'players.name': data.name }).first();

        getTitleLastUpdated = moment();
        return { status: 200, message: getTitleInfo }
      } else {
        getTitleInfo = await players.query()
          .join('titles', 'players.title', '=', 'titles.id')
          .select('titles.title_name', 'players.id')
          .whereRaw('LOWER(players.name) = ?', data.name.toLowerCase()).first();
        console.log(data.name)
        console.log(getTitleInfo)

        getTitlesInfo = getTitleInfo ? await players_titles.query()
          .join('titles', 'players_titles.title_id', '=', 'titles.id')
          .select('titles.title_name', 'titles.id')
          .where({ player_id: getTitleInfo.id }) : [];

        getTitleSLastUpdated = moment();
        const newTitleArray = [...getTitlesInfo, { in_use: getTitleInfo?.title_name }]
        getTitlesInfo = newTitleArray
        console.log('como vai title 1? ', newTitleArray)
        console.log('como vai title 2? ', getTitlesInfo)
        console.log('como vai title 3? ', getTitleInfo)

        return { status: 200, message: newTitleArray }
      }
    } catch (err) {
      console.log('Error trying get titles at: getCharacterTitlesRepo, ', err)
      return { status: 500, message: 'Internal errror' }
    }
  }
  let playerName = 0;
  let updateTitleLastUpdated = 0;

  const updateCharacterTitleInUseRepo = async (data) => {
    console.log('como to recebendo a data de use title?????????????? ', data);
    if (data.player_name == playerName && moment().diff(updateTitleLastUpdated, 'minutes') < 2) {
      console.log('ENTROU NO CASH!!!');
      console.log('CACHE EM GETTITLE FEITO COM SUCESSO!!!');
      return { status: 404, message: 'You need to wait 2 minuts to update title again!' }
    }
    try {
      await players.query().update({ title: data.title_id }).where({ name: data.player_name, deletion: 0 });
      playerName = data.player_name;
      updateTitleLastUpdated = moment();
      getTitleData = 0;
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