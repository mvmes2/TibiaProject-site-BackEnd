const { checkPassword, hashGenerator, sendEmailTo, generateToken } = require('../utils/utilities');
module.exports = app => {
    const { checkIfAccExists, updateAcc } = app.src.main.repository.UserRepository;

    const LoginAccService = async (data) => {
        const exists = await checkIfAccExists(data.email);
        if (!exists.bool) {
            return { status: 404, message: 'Wrong Email and Password, or Account does not exists!' }
        }

        const acc = exists.acc[0];

        console.log("User banco de dados", exists)
        
        const isPasswordValid = checkPassword(data.password, acc.password);

        if (!isPasswordValid) { return { status: 400, message: 'Wrong passwrod, if you forgot your password please use account recovery!' } };

       const hash = hashGenerator(8);

       const newLoginToken = generateToken(60, )

        const updateInfo = {
            loginHash: hash,
            web_lastlogin: Math.floor(Date.now() / 1000),
            login_token: newLoginToken
        }

        await updateAcc({ update: updateInfo, id: acc.id });
    return { status: 200, message: { id: acc.id, loginHash: hash, name: acc.name, login_token: newLoginToken }};
}
    return {
        LoginAccService,
    }
}