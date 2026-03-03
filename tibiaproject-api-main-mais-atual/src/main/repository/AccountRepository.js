require('dotenv').config();
const jwt = require('jsonwebtoken');
const { players, accounts, guild_membership, guilds } = require('../models/MasterModels');
const { setCreateCharacterController } = require('../utils/utilities');
const moment = require('moment');

module.exports = app => {

  let deleteCharacterLastUpdated = 0;
  let deleteCharacterData = 0;
  const deleteCharacter = async (data, validatedAccountID) => {
    if (!data || !data?.name) {
      return { status: 400, message: 'Missing data, bad request, name required!' }
    }

    if(deleteCharacterData == data.name && moment().diff(deleteCharacterLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait 3 minuts to try again!' }
    }

    try {
      deleteCharacterLastUpdated = moment();
      deleteCharacterData = data.name;

      const checkPlayerAccountId = await players.query().select('account_id', 'id').where({ name: data.name, deletion: 0 }).first();
      console.log('acc id', checkPlayerAccountId)
      if (validatedAccountID !== checkPlayerAccountId?.account_id) {
        return { status: 401, message: 'You dont have permission to access this account, or character not found!' }
      }

      await players.query().update({ deletion: 1 }).where({ id: checkPlayerAccountId.id, account_id: checkPlayerAccountId.account_id });
      setCreateCharacterController(0)
      return { status: 200, message: 'Character deleted successfuly!' }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
  }
  const updateHidenCharacterInDB = async (data, validatedAccountID) => {
    try {
      const ishiden = await players.query().select('hidden', 'account_id').where({ name: data.name, deletion: 0 }).first();
      if (validatedAccountID != ishiden.account_id) {
        return { status: 401, message: 'You dont have permission to access this account!' }
      }

      await players.query().update({ hidden: ishiden.hidden === 0 ? 1 : 0 }).where({ name: data.name, deletion: 0 });
      setCreateCharacterController(0);
      return { status: 200, message: 'Character hidden updated successfuly!' }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
  }

  let commentLastUpdated = 0;
  let commentAccID = 0;
  let commentCharName = 0;

  const updateCharacterCommentInDB = async (data, validatedAccountID) => {
    console.log('o que ta vindo data em updateCharacterCommentInDB? ', data)
    try {
      const comment = await players.query().select('comment', 'id', 'account_id').where({ name: data.name, deletion: 0 }).first();
      console.log(validatedAccountID)
      if (validatedAccountID != comment?.account_id) {
        return { status: 401, mesage: 'You do not have permission to access this account!' }
      }

      if (commentAccID == validatedAccountID && commentCharName == data.name && moment().diff(commentLastUpdated, 'minutes') < 3) {
        return { status: 400, message: 'You have to wait 3 minuts to update comment' }
      }
      console.log('qual comment vem ao updatar?', comment)
      comment == undefined || comment.comment == null || comment?.comment?.toString() != data?.comment?.toString() && await players.query().update({ comment: data.comment }).where({ id: comment.id });
      commentAccID = validatedAccountID;
      commentLastUpdated = moment();
      commentCharName = data.name;
      setCreateCharacterController(0);
      return { status: 200, message: 'Character comment updated successfuly!' }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
  }

  const checkNameAndEmail = async (data) => {

    if (!data || data === undefined || data === null) {
      return resp.status(500).send({
        message:
          "Internal error, please close the website and try again later, or open ticket!",
      });
    }
    const checkIfExistEmailFirst = await accounts.query().select('email').where({ email: data.email });
    const checkIfExistNameFirst = await accounts.query().select('email').whereRaw('LOWER(name) = ?', data.name.toLowerCase());

    if (checkIfExistNameFirst.length > 0) {
      return { status: 403, message: 'Account name already in use!' }
    }

    if (checkIfExistEmailFirst.length > 0) {
      return { status: 403, message: 'Email already in use!' }
    }
    return { status: 200, message: 'ok' }
  }

  let checkIfExixtsNameOrEmailOrBothAndReturnAccountLastUpdated = 0;
  let checkIfExixtsNameOrEmailOrBothAndReturnAccountData = 0;

  const checkIfExixtsNameOrEmailOrBothAndReturnAccount = async (name, email) => {

    let account = null;

    if (checkIfExixtsNameOrEmailOrBothAndReturnAccountData == name && moment().diff(checkIfExixtsNameOrEmailOrBothAndReturnAccountLastUpdated, 'minutes') <= 3 ||
      checkIfExixtsNameOrEmailOrBothAndReturnAccountData == email && moment().diff(checkIfExixtsNameOrEmailOrBothAndReturnAccountLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait at least 3 minuts to try again!' }
    }
    try {
      if (name !== null) {
        const checkIfExistNameFirst = await accounts.query().select('email', 'name').whereRaw('LOWER(name) = ?', name.toLowerCase());
        checkIfExixtsNameOrEmailOrBothAndReturnAccountLastUpdated = moment();
        checkIfExixtsNameOrEmailOrBothAndReturnAccountData = name;
        if (checkIfExistNameFirst.length < 1) {
          return { status: 400, message: 'Wrong or non-existent account name!' }
        }
        account = checkIfExistNameFirst;
      }

      if (email !== null) {
        checkIfExixtsNameOrEmailOrBothAndReturnAccountLastUpdated = moment();
        checkIfExixtsNameOrEmailOrBothAndReturnAccountData = email;
        const checkIfExistEmailFirst = await accounts.query().select('email', 'name', 'id').where({ email });
        if (checkIfExistEmailFirst.length < 1) {
          return { status: 400, message: 'Wrong or non-existent user email!' }
        }
        account = checkIfExistEmailFirst;
      }
      return { status: 200, message: account };
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error, open a ticket, or re-try later' }
    }
  }

  const emailChangePasswordTokenValidationUtility = (token) => {
    console.log('recebendo token', token)
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_GENERATE_EMAIL_CHANGE_PASSWORD_SECRET);
      return decoded;
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  let getAccountInfoRepositoryLastUpdated = 0;
  let getAccountInfoRepositoryData = 0;

  const getAccountInfoRepository = async (data) => {
    console.log(data);
    if (getAccountInfoRepositoryData == data?.token && moment().diff(getAccountInfoRepositoryLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait at least 3 minuts to try again!' }
    }
    try {
      const token = emailChangePasswordTokenValidationUtility(data?.token);
      console.log(token);
      let acc = [];

      if (token) {
        acc = await accounts.query().select('id', 'change_email_token').where({ id: token?.data?.id });
        console.log(acc, acc.length)
        if (acc.length > 0 && acc[0]?.change_email_token == 0) {
          getAccountInfoRepositoryLastUpdated = moment();
          getAccountInfoRepositoryData = data?.token;
          return { status: 200, message: 'ok' }
        } else if (acc.length < 1 || acc[0]?.change_email_token == 1) {
          return { status: 400, message: 'Account Not Found, or invalid, or expired password token!' }
        }
      }
      return { status: 500, message: 'internal error! open a ticket or call admin!' }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'internal error! open a ticket or call admin!' }
    }
  }

  let updateAccountPasswordByEmailLastUpdated = 0;
  let updateAccountPasswordByEmailData = 0;

  const updateAccountPasswordByEmail = async (data) => {
    console.log('como? ', data);
    if (updateAccountPasswordByEmailData == data?.token && moment().diff(updateAccountPasswordByEmailLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait at least 3 minuts to try again!' }
    }
    try {
      const token = emailChangePasswordTokenValidationUtility(data?.token);

      let acc = [];

      if (token) {
        acc = await accounts.query().select('id').where({ id: token?.data?.id }).first();
        await accounts.query().update({ password: data.update.password, change_email_token: 1 }).where({ id: acc?.id });
        updateAccountPasswordByEmailData = data?.token;
        updateAccountPasswordByEmailLastUpdated = moment();
        return { status: 200, message: 'ok' }
      }
      if (acc.length < 1) {
        return { status: 400, message: 'Account Not Found, or invalid, or expired password token!' }
      }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'internal error! open a ticket or call admin!' }
    }
  }

  let resetTokenEmailUsageLastUpdated = 0;
  let resetTokenEmailUsageData = 0;

  const resetTokenEmailUsage = async (tokenData) => {
    if (resetTokenEmailUsageData == tokenData && moment().diff(resetTokenEmailUsageLastUpdated, 'minutes') <= 3) {
      return { status: 401, message: 'You have to wait at least 3 minuts to try again!' }
    }

    try {
      const token = emailChangePasswordTokenValidationUtility(tokenData);

      let acc = [];
      if (token) {
        acc = await accounts.query().select('id').where({ id: token?.data?.id }).first();
        await accounts.query().update({ change_email_token: 0 }).where({ id: acc.id });
        resetTokenEmailUsageLastUpdated = moment();
        resetTokenEmailUsageData = tokenData;
        return { status: 200, message: 'generated' };
      }
      if (acc.length < 1) {
        return { status: 400, message: 'Account Not Found, or invalid, or expired password token!' }
      }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'internal error! open a ticket or call admin!' }
    }
  }

  let changeEmailByRKLastUpdated = 0;
  let changeEmailByRKdata = 0;

  const changeEmailByRK = async (data) => {

    if (changeEmailByRKdata == data.email && moment().diff(changeEmailByRKLastUpdated, 'minutes') <= 3) {
      return { stauts: 401, message: 'You have to wait at least 3 minuts to try again!' }
    }

    const changeEmailByRKUtility = (token) => {
      console.log('recebendo token', token)
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_GENERATE_EMAIL_CHANGE_BY_RK_SECRET);
        return decoded;
      } catch (err) {
        console.log(err);
        return false;
      }
    }

    try {
      const token = changeEmailByRKUtility(data.token);

      let acc = [];

      if (token) {
        acc = await accounts.query().select('id').where({ email: data.email });
      }
      if (acc.length > 0) {
        return { status: 401, message: 'New email already in use!' }
      } else {
        await accounts.query().update({ email: data.email }).where({ id: token?.data?.id });
        changeEmailByRKLastUpdated = moment();
        changeEmailByRKdata = data.email;
        return { status: 200, message: 'Email updated successfully!' }
      }
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'internal error! open a ticket or call admin!' }
    }
  }

  const validateJsonTokenRepository = async (data) => {
    const acc = await accounts.query().select('change_pass_token').where({ id: data.id }).first();
    console.log(acc);
    return { status: 200, message: 'ok' }
  }

  const internalOnlyCheckAccountDoNotSendResponseToFront = async (data) => {
    console.log('oque ta vindo ai?', data)
    try {
      const acc = data.id ? await accounts.query().select('id', 'email', 'recovery_key').where({ id: data.id }) : (
        data.name ? await accounts.query().select('id', 'email', 'recovery_key').where({ name: data.name }) : (
          await accounts.query().select('id', 'email', 'recovery_key').where({ email: data.email })
        )
      )
      if (!acc || acc === undefined || acc === null || acc?.length < 1) {
        return false;
      }
      return acc;
    } catch (err) {
      console.log(err);
      return { status: 500, message: 'Internal error at trying to get account!' }
    }
  }

  let getCharacterListFromAccountLastUpdated = 0;
  let getCharacterListFromAccountData = 0;
  let getCharacterListFromAccountDataCheck = 0;

  const getCharacterListFromAccount = async (data) => {
    console.log('oka ta vinda aka???????????????????????????? ', data);
    console.log('validation 0 ', data);
    console.log('validation 1 ', getCharacterListFromAccountData);
    console.log('validation 2 ', getCharacterListFromAccountDataCheck);
    if (getCharacterListFromAccountDataCheck.email == data.email && moment().diff(getCharacterListFromAccountLastUpdated, 'minutes') <= 3) {
      console.log('ENTROUUUUUU NO CACHE getCharacterListFromAccount!')
      return { status: 200, message: getCharacterListFromAccountData }
    }
    try {
      getCharacterListFromAccountDataCheck = data;
      const characterListCheck = await accounts.query().select('id').where({ email: data.email, deletion: 0 }).first();
      console.log('charcheck? ', characterListCheck)
      const characterList = await players.query().select('id', 'name', 'world_id', 'level').where({ account_id: characterListCheck.id, deletion: 0 }).where({ world_id: data.world_id });
      const editedCharList = [];

      for (x in characterList) {
        const guildMember = await guild_membership.query().select('guild_id').where({ player_id: characterList[x].id }).first();
        let guildName = null;
        if (guildMember) {
          guildName = await guilds.query().select('name').where({ id: guildMember.guild_id }).first();
        }
        delete characterList[x].id;
        const newChar = {
          ...characterList[x],
          guild: guildName?.name
        }
        editedCharList.push(newChar);

      }
      getCharacterListFromAccountLastUpdated = moment();
      getCharacterListFromAccountData = editedCharList;
      return { status: 200, message: getCharacterListFromAccountData }
    } catch (err) {
      console.log('error while trying to retrieve Characterlist at: getCharacterListFromAccount, ', err);
      return { status: 500, message: 'Internal error at trying to get account!' }
    }
  }

  let getInfoFromAccountLastUpdated = 0;
  let getInfoFromAccountDataID = 0;
  let getInfoFromAccountData = 0;

  const getInfoFromAccount = async (data) => {
    console.log('como vem esta data doidada???????????? ', data)
    if (getInfoFromAccountDataID == data.id && moment().diff(getInfoFromAccountLastUpdated, 'minutes') <= 3) {
      return { status: 200, message: getInfoFromAccountData }
    }
    try {
      const account = await accounts.query().select('name', 'coins', 'coins_transferable').where({ id: data.id }).first();
      getInfoFromAccountLastUpdated = moment();
      getInfoFromAccountDataID = data.id;
      getInfoFromAccountData = account;
      return { status: 200, message: getInfoFromAccountData }
    } catch (err) {
      console.log('error while trying to retrieve AccountInfo at: getInfoFromAccount, ', err);
      return { status: 500, message: 'Internal error at trying to get account!' }
    }
  }

  const getPlayerQuantityRepository = async () => {
    try {
      /* devolve numero de players que tenha account_id diferentes, lastip diferentes, e que sejam no minimo level 8.

      segue a query com sintaxe padrão de Mysql para se ter uma base da conversão abaixo para sintaxe do knex:

      SELECT count(id_acc) FROM (
        SELECT count(teste.last_ip_agrupado), teste.id_acc FROM (
        SELECT count(id) as 'quantidade',lastip as 'last_ip_agrupado',account_id as 'id_acc' FROM tibiaproject.players WHERE level >= 8
        AND group_id = 1 GROUP BY players.lastip, players.account_id) as teste
        WHERE 1
         GROUP BY teste.id_acc
         ) as finalTable

      */
      const getPlayersWithouAdminAccounts = await players.query()
        .select(players.raw('count(finalTable.id_acc) as finalResult'))
        .from(function () {
          this.select(players.raw('count(teste.last_ip_agrupado)'), 'teste.id_acc')
            .from(function () {
              this.select(
                players.raw('count(id) as quantidade'),
                'lastip as last_ip_agrupado',
                'account_id as id_acc'
              )
                .from('tibiaproject.players')
                .where('level', '>=', 8)
                .andWhere('group_id', 1)
                .andWhere('deletion', '==', 0)
                .groupBy('players.lastip', 'players.account_id')
                .as('teste');
            })
            .whereNotNull('teste.last_ip_agrupado') // Adicionamos esta condição para evitar contagens nulas
            .groupBy('teste.id_acc')
            .as('finalTable');
        });

      const result = getPlayersWithouAdminAccounts[0].finalResult

      console.log('..........: ', result);

      return { status: 200, message: result }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error, re-open webSite and try again, or contact Admin!' }
    }
  }

  return {
    updateHidenCharacterInDB,
    deleteCharacter,
    updateCharacterCommentInDB,
    checkNameAndEmail,
    checkIfExixtsNameOrEmailOrBothAndReturnAccount,
    getAccountInfoRepository,
    validateJsonTokenRepository,
    internalOnlyCheckAccountDoNotSendResponseToFront,
    getCharacterListFromAccount,
    getInfoFromAccount,
    getPlayerQuantityRepository,
    updateAccountPasswordByEmail,
    resetTokenEmailUsage,
    changeEmailByRK
  }
}