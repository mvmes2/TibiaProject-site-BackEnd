const { encryptPassword } = require('../utils/utilities');
module.exports = app => {
    const { InsertNewAccount } = app.src.main.repository.UserRepository;

    const CreateAccService = async (data) => {
        const encrypted = encryptPassword(data.password);
        data.password = encrypted;
        const resp = await InsertNewAccount(data);
    return { status: resp.status, message: resp.message};
}

    return {
        CreateAccService
    }
}