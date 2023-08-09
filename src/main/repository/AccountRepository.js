const { players, players_comment, accounts, guild_membership, guilds } = require('./../models/projectModels');
module.exports = app => {
  const deleteCharacter = async (data) => {
    try {
      await players.query().delete().where({ id: data.id });
      return { status: 200, message: 'Character deleted successfuly!' }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
  }
  const updateHidenCharacterInDB = async (data) => {
    try {
      const ishiden = await players.query().select('hidden').where({ id: data.id }).first();

      await players.query().update({ hidden: ishiden.hidden === 0 ? 1 : 0 }).where({ id: data.id });
      return { status: 200, message: 'Character hidden updated successfuly!' }
    } catch (err) {
      console.log(err)
      return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
  }

  const updateCharacterCommentInDB = async (data) => {

    try {
      const comment = await players_comment.query().select('comment').where({ player_id: data.id }).first();
      comment === undefined ? await players_comment.query().insert({ comment: data.comment, player_id: data.id }).where({ player_id: data.id }) : (
        await players_comment.query().update({ comment: data.comment }).where({ player_id: data.id })
      )
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

  const checkIfExixtsNameOrEmailOrBothAndReturnAccount = async (name, email) => {
    let account = null;
    try {
      if (name !== null) {
        const checkIfExistNameFirst = await accounts.query().select('email', 'name').whereRaw('LOWER(name) = ?', name.toLowerCase());
        if (checkIfExistNameFirst.length < 1) {
          return { status: 400, message: 'Wrong or non-existent account name!' }
        }
        account = checkIfExistNameFirst;
      }

      if (email !== null) {
        const checkIfExistEmailFirst = await accounts.query().select('email', 'name', 'id', 'password2').where({ email });
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
  const getAccountInfoRepository = async (data) => {
    try {
      const acc = await accounts.query().select(data?.selectinfo ? data.selectinfo : 'change_pass_token').where({ id: data.id });
      if (acc.length < 1) {
        return { status: 400, message: '!Account Not Found.' }
      }
      return { status: 200, message: acc }
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
      const acc = data.id ? await accounts.query().select('*').where({ id: data.id }) : (
        data.name ? await accounts.query().select('*').where({ name: data.name }) : (
          await accounts.query().select('*').where({ email: data.email })
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

  const getCharacterListFromAccount = async (data) => {
    try {
      const characterList = await players.query().select('id', 'name', 'world_id', 'level').where({ account_id: data.id }).where({ world_id: data.world_id });
      const editedCharList = [];

      for (x in characterList) {
        const guildMember = await guild_membership.query().select('guild_id').where({ player_id: characterList[x].id }).first();
        let guildName = null;
        if (guildMember) {
          guildName = await guilds.query().select('name').where({ id: guildMember.guild_id }).first();
        }
        const newChar = {
          ...characterList[x],
          guild: guildName?.name
        }
        editedCharList.push(newChar);
      }
      return { status: 200, message: editedCharList }
    } catch (err) {
      console.log('error while trying to retrieve Characterlist at: getCharacterListFromAccount, ', err);
      return { status: 500, message: 'Internal error at trying to get account!' }
    }
  }

  const getInfoFromAccount = async (data) => {
    try {
      const account = await accounts.query().select('id', 'name', 'coins').where({ id: data.id }).first();
      return { status: 200, message: account }
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
    getPlayerQuantityRepository
  }
}