const { SHA1 } = require("crypto-js");

module.exports = app => {
    const { InsertNewAccount } = app.src.main.repository.UserRepository;

    const CreateAccService = async (data) => {
        const encrypt = SHA1(data.password).toString()
        data.password = encrypt;
        console.log('response do service');
        const resp = await InsertNewAccount(data);
    return { status: resp.status, message: resp.message};
}

    return {
        CreateAccService
    }
}