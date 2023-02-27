const { accounts } = require('../models/projectModels');

module.exports = app => {
    const InsertNewAccount = async (data) => {
        const checkIfExistFirst = await accounts.query().select('email').where({ email: data.email });

        if (checkIfExistFirst.length > 0) {
            return {status: 403, message: 'Usuário já existe'}
        }
        try {
            const resp = await accounts.query().insert(data);
            return { status: 201, data: resp};
        } catch(err) {
            console.log(err)
            return { status: 500, data: err }
        }

    
}
    return {
        InsertNewAccount,
    }
}