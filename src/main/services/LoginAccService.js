const { checkPassword, hashGenerator } = require('../utils/utilities');
module.exports = app => {
    const { checkIfAccExists, updateAcc } = app.src.main.repository.UserRepository;

    const LoginAccService = async (data) => {
        const exists = await checkIfAccExists(data.email);
        if (!exists.bool) {
            return { status: 404, message: 'Conta Não existe, ou email inválido!' }
        }

        const acc = exists.acc[0];
        
        const isPasswordValid = checkPassword(acc.password, data.password);

        if (!isPasswordValid) { return { status: 403, message: 'Password inválida, se esqueceu sua senha, use "Recuperar Account"!' } };

       const hash = hashGenerator(8);

        const updateInfo = {
            loginHash: hash,
        }

        await updateAcc({ update: updateInfo, id: acc.id });

    return { status: 200, message: { id: acc.id, loginHash: hash }};
}
    return {
        LoginAccService,
    }
}