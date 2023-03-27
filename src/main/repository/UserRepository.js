const { accounts, players, players_online, player_deaths, player_items, players_comment } = require('../models/projectModels');
const { convertPremiumTimeToDaysLeft, updateLastDayTimeStampEpochFromGivenDays } = require('../utils/utilities');

module.exports = app => {

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
      const resp = await accounts.query().insert(data);
      const { id, ...rests } = resp;
      return { status: 201, message: id };
    } catch (err) {
      console.log(err)
      return { status: 500, message: err }
    }
  }

  const checkIfAccExists = async (data) => {
    const exists = await accounts.query().select('email', 'id', 'password', 'name').where({ email: data });
    if (!exists || exists === undefined || exists?.length < 1) {
      return { bool: false };
    } else {
      return { acc: exists, bool: true };
    }
  }

  const validateLoginHash = async (data) => {
    try {
      const validHash = await accounts.query().select('loginHash').where({ id: Number(data.id) }).first();

    if (!data?.loginHash || !validHash || validHash === undefined) { return { status: 403, message: 'error at login hash' } }

    if (validHash.loginHash.trim() !== data?.loginHash.trim()) {
      return {
        status: 403, message: `close this page, re-open the website, and try again! or call admin!`
      }
    };

    const acc = await accounts.query().select('id', 'name', 'email', 'country', 'lastday', 'coins', 'isBanned', 'banReason', 'premdays', 'createdAt', 'day_end_premmy').where({ id: Number(data.id) }).first();
    

      if (Number(acc.premdays) > 0) {
        if (acc.day_end_premmy !== 0 && acc.premdays > 0) {

          const dataToUpdatePremDays = {
            id: acc.id,
            update: {
              premdays: convertPremiumTimeToDaysLeft(Number(acc.day_end_premmy))
            }
          }
          await updateAcc(dataToUpdatePremDays);
        }
        if (Number(Date.now()) >= (Number(acc.day_end_premmy) * 1000) || Number(acc.day_end_premmy) === 0) {
          console.log('é 0 mesmo')
          const updatedLastDays = (updateLastDayTimeStampEpochFromGivenDays(Number(acc.premdays), Number(acc.day_end_premmy)) + 86400);

          const dataToUpdateLastDay = {
            id: acc.id,
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
      const deathList = await player_deaths.query().select('time', 'level', 'killed_by', 'unjustified', 'is_player', 'mostdamage_by').where({ player_id: characters[x].id });
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
    const accUpdatedPremiumTime = await accounts.query().select('id', 'name', 'email', 'country', 'lastday', 'coins', 'isBanned', 'banReason', 'premdays', 'createdAt', 'day_end_premmy').where({ id: Number(data.id) }).first();
    const accInfo = {
      ...accUpdatedPremiumTime,
      editedCharList,
    }

    return { status: 200, message: accInfo };
    } catch(err) {
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
    const checkOnlyPlayerNameFirst = await players.query().select('name', 'account_id').where({ name: data.name });

    if (checkOnlyPlayerNameFirst.length < 1) { return { status: 404, message: 'Character does not exists!' } }
    let checkCharacterOwner = null;
    try {
      checkCharacterOwner = await players.query()
        .join('worlds', 'players.world_id', '=', 'worlds.id')
        .join('vocations', 'players.vocation', 'vocations.vocation_id')
        .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName as world', 'players.createdAt', 'group_id', 'players.hidden')
        .where({ name: data.name })
        .where({ account_id: data.account_id })
        .where({ 'players.deletedAt': 0 }).first();
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!s' }
    }
    if (checkCharacterOwner === undefined || checkCharacterOwner === null) {
      try {

        const found = await players.query()
          .join('worlds', 'players.world_id', '=', 'worlds.id')
          .join('vocations', 'players.vocation', 'vocations.vocation_id')
          .select('players.id', 'players.account_id', 'players.hidden', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName as world', 'players.createdAt', 'group_id', 'players.hidden')
          .where({ name: data.name })
          .where({ 'players.deletedAt': 0 }).first();

        const deathList = await player_deaths.query()
          .select('time', 'level', 'killed_by', 'unjustified', 'is_player', 'mostdamage_by')
          .where({ player_id: found.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: found.id }).first();
        const comment = await players_comment.query().select('comment').where({ player_id: found.id }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: found.account_id });


        const characterOwnershipFalse = {
          ...found,
          deathList,
          owner: false,
          accountCharList: found.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false
        }
        return { status: 200, message: characterOwnershipFalse, owner: false }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!a' }
      }
    } else {
      try {
        const deathList = await player_deaths.query()
          .select('time', 'level', 'killed_by', 'unjustified', 'is_player', 'mostdamage_by')
          .where({ player_id: checkCharacterOwner.id }).orderBy('time', 'desc').limit(15);
        const online = await players_online.query().select('*').where({ player_id: checkCharacterOwner.id }).first();
        const comment = await players_comment.query().select('comment').where({ player_id: checkCharacterOwner.id }).first();
        const accountCharList = await players.query().select('name', 'hidden').where({ account_id: checkCharacterOwner.account_id });
        const characterOwnershipTrue = {
          ...checkCharacterOwner,
          deathList,
          owner: true,
          accountCharList: checkCharacterOwner.hidden === 0 ? accountCharList : [],
          comment: comment?.comment,
          isOnline: online?.player_id ? true : false
        }
        return { status: 200, message: characterOwnershipTrue }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'erro interno, contate a administração ou abra um ticket!' }
      }
    }
  }

 

  return {
    checkIfAccExists,
    InsertNewAccount,
    updateAcc,
    validateLoginHash,
    createNewCharacterDB,
    checkCharacterOwnerAtDB,
  }
}