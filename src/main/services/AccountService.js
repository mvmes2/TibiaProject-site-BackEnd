const { projectMailer, generateToken, hashGenerator, encryptPassword } = require("../utils/utilities");

module.exports = app => {
  const { validateLoginHash, createNewCharacterDB, checkCharacterOwnerAtDB, updateAcc } = app.src.main.repository.UserRepository;
  const { deleteCharacter, updateHidenCharacterInDB, updateCharacterCommentInDB, 
    checkIfExixtsNameOrEmailOrBothAndReturnAccount, validateJsonTokenRepository, 
    internalOnlyCheckAccountDoNotSendResponseToFront } = app.src.main.repository.AccountRepository;

  const checkValidLoginHash = async (data) => {
    const resp = await validateLoginHash(data);
    return { status: resp.status, message: resp.message };
  }

  const createCharacterSerice = async (data) => {

    const resp = await createNewCharacterDB(data);
    return { status: resp.status, message: resp.message };
  }

  const validateCharacterService = async (data) => {
    const resp = await checkCharacterOwnerAtDB(data);
    return { status: resp.status, message: resp.message };
  }

  const deleteCharacterService = async (data) => {
    const resp = await deleteCharacter(data);
    return { status: resp.status, message: resp.message };
  }

  const updateHidenCharacterService = async (data) => {
    const resp = await updateHidenCharacterInDB(data);
    return { status: resp.status, message: resp.message };
  }

  const updateCharacterCommentService = async (data) => {
    const resp = await updateCharacterCommentInDB(data);
    return { status: resp.status, message: resp.message };
  }

  const recoveryAccountGenericService = async (data) => {
    if (Object.keys(data).length < 1) {
      console.log('no data received!')
      return { status: 400, message: 'no data received!' }
    }

    if (data.trigger === 'emailCheck') {
      const returnal = await checkIfExixtsNameOrEmailOrBothAndReturnAccount(null, data.email);
      if (returnal.status === 200) {
        console.log('retorno', returnal);
        const acc = returnal.message[0];
        console.log(acc);
        const newToken = generateToken(30, acc)
        const link = `${process.env.BASE_URL_IP}:3000/account-changepassword/${hashGenerator(16)}-${acc.id}`;
        try {
          projectMailer.changePassword(
            acc.email,
            acc.name,
            acc.password2,
            link
          );
          const toUpdate = {
            id: acc.id,
            update: {
              change_pass_token: newToken
            }
          }
          await updateAcc(toUpdate);
          return { status: 200, message: newToken };
        } catch (err) {
          console.log(err);
        }
      }
      return { status: 400, message: 'User email not found!' };
    }

    if (data.trigger === 'changePassUpdate') {
      try {
        data.update.password = encryptPassword(data.update.password);
       const up = await updateAcc(data);
       return { status: up.status, message: up.message }
      } catch(err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }

    if (data.trigger === 'rkCheck') {
      data.rk = data.rk.toUpperCase();
      try {
        const checkaccount = await internalOnlyCheckAccountDoNotSendResponseToFront({email: data.email});
        if (!checkaccount) {
          return { status: 404, message: 'No account found with that email!' }
        }
        const acc = checkaccount[0];

        if (acc.recovery_key !== data.rk) {
          return { status: 403, message: 'Given rk do not match with account rk' }
        }
        return { status: 200, message: acc.id }
      } catch(err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }
    if (data.trigger === 'updateEmailByRK') {
      console.log('data pra troca email: ', data)
      try {
        const dataTupdate = {
          id: data.id,
          update:{
            email: data.email
          }
        }
        const up = await updateAcc(dataTupdate);
        return { status: up.status, message: up.message }
      } catch(err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }
    
  }

  const validateJsonTokenService = async (data) => {
    const resp = await validateJsonTokenRepository(data);
    console.log('service resp from repo: ',resp);
    return { status: 200, message: 'ok' }
  }

  return {
    checkValidLoginHash,
    createCharacterSerice,
    validateCharacterService,
    deleteCharacterService,
    updateHidenCharacterService,
    updateCharacterCommentService,
    recoveryAccountGenericService,
    validateJsonTokenService
  }
}