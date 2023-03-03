const { accounts, players, players_online, player_deaths, player_items } = require('../models/projectModels');

module.exports = app => {
    const InsertNewAccount = async (data) => {
        const checkIfExistEmailFirst = await accounts.query().select('email').where({ email: data.email });
        const checkIfExistNameFirst = await accounts.query().select('email').where({ name: data.name });

        if (checkIfExistNameFirst.length > 0) {
            return {status: 403, message: 'Usuário já existe'}
        }

        if (checkIfExistEmailFirst.length > 0) {
            return {status: 403, message: 'Email já existe'}
        }
        try {
            data.createdAt = Math.floor(Date.now() / 1000);
            const resp = await accounts.query().insert(data);
            return { status: 201, data: resp};
        } catch(err) {
            console.log(err)
            return { status: 500, data: err }
        }    
}

const updateAcc = async(data) => {
    console.log('logando data para update...: ', data)
    try { 
        await accounts.query().update(data.update).where({ id: data.id });
        return { status: 200, message: 'acc atualizada com sucesso!' };
     } catch(err) {
        console.log(err);
        return { status: 500, message: 'Algo deu errado, contate um administrador, ou abra um ticket!' }
     }
}

const checkIfAccExists = async (data) => {
    const exists = await accounts.query().select('email', 'id', 'password').where({ email: data });
    if (!exists || exists === undefined || exists?.length < 1) {
        return { bool: false };
    } else {
        return { acc: exists, bool: true };
    }
}

const validateLoginHash = async (data) => {
    console.log('consolando data hashlogin', data)
    const validHash = await accounts.query().select('loginHash').where({ id: Number(data.id) }).first();

    if (!data?.loginHash || !validHash || validHash === undefined) { return { status: 403, message:'error' } }
    console.log('consolando data hashlogin', data.loginHash.trim())
    console.log('consolando data hashlogin2', validHash?.loginHash.trim())
    if (validHash.loginHash.trim() !== data?.loginHash.trim()) { return { status: 403, message:`Segurança da conta pode estar comprometida, entre em contato com um administrador,
     ou abra um ticket! \n Por segurança nenhuma informação da sua conta será informada aqui!` } };

    const acc = await accounts.query().select('name', 'email', 'country', 'lastday', 'coins', 'isBanned', 'banReason' , 'premdays', 'createdAt').where({ id: Number(data.id) }).first();
    const characters = await players.query()
    .join('worlds', 'players.world_id', '=', 'worlds.id')
    .join('vocations', 'players.vocation', 'vocations.vocation_id')
    .select('players.id', 'players.name', 'players.level', 'vocation_name as vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName', 'players.createdAt', 'group_id')
    .where({ account_id: Number(data.id) })
    .where({ 'players.deletedAt': 0 });

    console.log('pré load char', characters)

    const editedCharList = [];

    for( x in characters ) {
        const deathList = await player_deaths.query().select('time', 'level', 'killed_by', 'unjustified', 'is_player').where({ player_id: characters[x].id }).limit(15);
        const online = await players_online.query().select('*').where({ player_id: characters[x].id });

        console.log('deatNote', deathList);

        const newCharInfo = {
            ...characters[x],
            deathList,
            isOnline: online[0]?.player_id ? true : false,
        }
        editedCharList.push(newCharInfo);
    }

    const accInfo = {
        ...acc,
        editedCharList,
    }

    console.log('log Data da conta', accInfo);
    return { status: 200, message: accInfo};
}

const createNewCharacterDB = async (data) => {
    const checkNameExist = await players.query().select('name').where({ name: data.name });
    const femaleCharacter = {
        ...data,
        looktype: 136
    }
    if (!checkNameExist || checkNameExist === undefined || checkNameExist?.length < 1) {
        try {
            await players.query().insert(data.sex === 0 ? femaleCharacter : data);

            const getCreatedPlayer = await players.query().select('id').where({ name: data.name }).first();

            const newComersIinitialItens = [
                { player_id: Number(getCreatedPlayer.id), pid: 3, sid: 101, itemtype: 2853, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 4, sid: 102, itemtype: 3561, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 11, sid: 103, itemtype: 23396, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 104, itemtype: 3291, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 105, itemtype: 3270, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 106, itemtype: 3293, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 107, itemtype: 21401, count: 1 },
                { player_id: Number(getCreatedPlayer.id), pid: 101, sid: 108, itemtype: 3585, count: 1 }
            ]
            newComersIinitialItens.map( async (each) => {
                await player_items.query().insert(each);
            })
            return { status: 201, message: 'Criado!' }
        } catch(err) {
            console.log(err);
            return { status: 500, message: 'erro interno, contate um administrador!'}
        }
    } else {
        return { status: 400, message: 'Nome já existe!' };
    }
}

    return {
        checkIfAccExists,
        InsertNewAccount,
        updateAcc,
        validateLoginHash,
        createNewCharacterDB
    }
}