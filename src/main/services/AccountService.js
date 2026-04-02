const { projectMailer, generateChangeEmailByRKToken, generateEmailPasswordChangeToken } = require("../utils/utilities");
const moment = require('moment');

module.exports = app => {
  const { validateLoginHash, createNewCharacterDB, checkCharacterOwnerAtDB, updateAcc } = app.src.main.repository.UserRepository;
  const { deleteCharacter, updateHidenCharacterInDB, updateCharacterCommentInDB,
    checkIfExixtsNameOrEmailOrBothAndReturnAccount, validateJsonTokenRepository,
    internalOnlyCheckAccountDoNotSendResponseToFront, resetTokenEmailUsage, updateAccountPasswordByEmail, changeEmailByRK } = app.src.main.repository.AccountRepository;

  const checkValidLoginHash = async (data) => {
    const resp = await validateLoginHash(data);
    return { status: resp.status, message: resp.message };
  }

  const createCharacterSerice = async (data, isValidToken) => {

    const resp = await createNewCharacterDB(data, isValidToken);
    return { status: resp.status, message: resp.message };
  }

  const validateCharacterService = async (data) => {
    const resp = await checkCharacterOwnerAtDB(data);
    return { status: resp.status, message: resp.message };
  }

  const deleteCharacterService = async (data, validatedAccountID) => {
    const resp = await deleteCharacter(data, validatedAccountID);
    return { status: resp.status, message: resp.message };
  }

  const updateHidenCharacterService = async (data, validatedAccountID) => {
    const resp = await updateHidenCharacterInDB(data, validatedAccountID);
    return { status: resp.status, message: resp.message };
  }

  const updateCharacterCommentService = async (data, validatedAccountID) => {
    const resp = await updateCharacterCommentInDB(data, validatedAccountID);
    return { status: resp.status, message: resp.message };
  }

  let recoveryAccountGenericEmailChangePassServiceLastUpdate = 0;
  let recoveryAccountGenericEmailChangePassServiceData = 0;
  let encryptedPassword = 0;

  const recoveryAccountGenericService = async (data) => {
    if (Object.keys(data).length < 1) {
      console.log('no data received!')
      return { status: 400, message: 'no data received!' }
    }

    if (recoveryAccountGenericEmailChangePassServiceData == data.email || encryptedPassword == data?.update?.password && moment().diff(recoveryAccountGenericEmailChangePassServiceLastUpdate, 'minutes') <= 15) {
      return { status: 401, message: 'You have to wait 15 minuts to request password change again!' }
    }

    if (data.trigger === 'emailCheck') {
      const returnal = await checkIfExixtsNameOrEmailOrBothAndReturnAccount(null, data.email);
      if (returnal.status === 200) {
        console.log('retorno', returnal);
        const acc = returnal.message[0];
        console.log(acc);
        const newToken = generateEmailPasswordChangeToken(30, acc);
        const link = `${process.env.BASE_URL_IP_FRONT}/account-changepassword/${newToken}`;
        try {
          projectMailer.changePassword(
            acc.email,
            acc.name,
            link
          );
          recoveryAccountGenericEmailChangePassServiceLastUpdate = moment();
          recoveryAccountGenericEmailChangePassServiceData = data.email;
          const emailtokenreset = await resetTokenEmailUsage(newToken);
          return { status: emailtokenreset.status, message: emailtokenreset.message };
        } catch (err) {
          console.log(err);
        }
      }
      return { status: 400, message: 'User email not found!' };
    }

    if (data.trigger === 'changePassUpdate') {
      if (!data?.update?.password || !/^[a-f0-9]{40}$/i.test(data.update.password)) {
        return { status: 400, message: 'Invalid password format. Expected SHA-1 hash.' };
      }
      try {
        const up = await updateAccountPasswordByEmail(data);

        recoveryAccountGenericEmailChangePassServiceLastUpdate = moment();
        encryptedPassword = data.update.password;

        return { status: up.status, message: up.message }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }

    if (data.trigger === 'rkCheck') {
      console.log('RkChange', data)
      data.rk = data.rk.toUpperCase();
      try {
        const checkaccount = await internalOnlyCheckAccountDoNotSendResponseToFront({ email: data.email });
        if (!checkaccount) {
          return { status: 404, message: 'No account found with that email!' }
        }
        const acc = checkaccount[0];

        if (acc.recovery_key !== data.rk) {
          return { status: 403, message: 'Given rk do not match with account rk' }
        }
        const newToken = generateChangeEmailByRKToken(20, acc);
        return { status: 200, message: newToken }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }
    if (data.trigger === 'updateEmailByRK') {
      console.log('data pra troca email: ', data)
      try {
        
        const up = await changeEmailByRK(data);
        return { status: up.status, message: up.message }
      } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal error!' }
      }
    }

  }

  const validateJsonTokenService = async (data) => {
    const resp = await validateJsonTokenRepository(data);
    console.log('service resp from repo: ', resp);
    return { status: 200, message: 'ok' }
  }

  let updateAccountPasswordServiceLastUpdated = 0;
  let updateAccountPasswordServiceAccountId = 0;

  const updateAccountPasswordService = async (data, accountId) => {
    // Password must arrive pre-encrypted as SHA-1 hex (40 chars) from the frontend
    if (!data.password || !/^[a-f0-9]{40}$/i.test(data.password)) {
      return { status: 400, message: 'Invalid password format. Expected SHA-1 hash.' };
    }

    if (updateAccountPasswordServiceAccountId == accountId && moment().diff(updateAccountPasswordServiceLastUpdated, 'minutes') <= 3) {
      return { status: 429, message: 'You have to wait at least 3 minutes to change password again!' };
    }

    const dataToUpdate = {
      id: Number(accountId),
      update: {
        password: data.password,
      }
    };
    const resp = await updateAcc(dataToUpdate);
    updateAccountPasswordServiceLastUpdated = moment();
    updateAccountPasswordServiceAccountId = accountId;
    return { status: resp.status, message: resp.message };
  }

  return {
    checkValidLoginHash,
    createCharacterSerice,
    validateCharacterService,
    deleteCharacterService,
    updateHidenCharacterService,
    updateCharacterCommentService,
    recoveryAccountGenericService,
    validateJsonTokenService,
    updateAccountPasswordService,
  }
}