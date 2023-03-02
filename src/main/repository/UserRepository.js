const { accounts, players } = require('../models/projectModels');

module.exports = app => {
    const InsertNewAccount = async (data) => {
        const checkIfExistFirst = await accounts.query().select('email').where({ email: data.email });

        if (checkIfExistFirst.length > 0) {
            return {status: 403, message: 'Usuário já existe'}
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
    const validHash = await accounts.query().select('loginHash').where({ id: Number(data.id) }).first();
    console.log('accountHash', validHash.loginHash)
    console.log('siteHash', data.loginHash)
    if (validHash.loginHash.trim() !== data.loginHash.trim()) { return { status: 403, message:`Segurança da conta pode estar comprometida, entre em contato com um administrador,
     ou abra um ticket! \n Por segurança nenhuma informação da sua conta será informada aqui!` } };

    const acc = await accounts.query().select('name', 'email', 'country', 'lastday', 'coins', 'isBanned', 'banReason' , 'premdays', 'createdAt').where({ id: Number(data.id) }).first();
    const characters = await players.query()
    .join('worlds', 'players.world_id', '=', 'worlds.id')
    .select('name', 'level', 'vocation', 'sex', 'lastlogin', 'lastip', 'worlds.serverName', 'players.createdAt')
    .where({ account_id: Number(data.id) });

    const accInfo = {
        ...acc,
        characters,
    }

    console.log('log Data da conta', accInfo);
    return { status: 200, message: accInfo};
}

    return {
        checkIfAccExists,
        InsertNewAccount,
        updateAcc,
        validateLoginHash
    }
}