const { players, players_comment, accounts } = require('./../models/projectModels');
module.exports = app => {
    const deleteCharacter = async (data) => {
        try {
            await players.query().delete().where({ id: data.id });
            return { status: 200, message: 'Character deleted successfuly!' }
        } catch(err) {
            console.log(err)
            return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
        }
}
const updateHidenCharacterInDB = async (data) => {
    try {
       const ishiden = await players.query().select('hidden').where({ id: data.id }).first();

       await players.query().update({ hidden: ishiden.hidden === 0 ? 1 : 0 }).where({ id: data.id });
        return { status: 200, message: 'Character hidden updated successfuly!' }
    } catch(err) {
        console.log(err)
        return { status: 500, message: 'Internal error at trying delete, re-open webSite and try again, or contact Admin!' }
    }
}

const updateCharacterCommentInDB = async (data) => {

    try {
       const comment = await players_comment.query().select('comment').where({ player_id: data.id }).first();
       comment === undefined ? await players_comment.query().insert({ comment: data.comment, player_id: data.id}).where({ player_id: data.id }) : (
        await players_comment.query().update({ comment: data.comment}).where({ player_id: data.id })
       )
        return { status: 200, message: 'Character comment updated successfuly!' }
    } catch(err) {
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
        if (name) {
            const checkIfExistNameFirst = await accounts.query().select('email').whereRaw('LOWER(name) = ?', name.toLowerCase());
            if (checkIfExistNameFirst.length < 1) {
              return { status: 400, message: 'Wrong or non-existent account name!' }
            }
            account = checkIfExistNameFirst;
           }
           
           if (email) {
             const checkIfExistEmailFirst = await accounts.query().select('email').where({ email });
             if (checkIfExistEmailFirst.length < 1) {
               return { status: 400, message: 'Wrong or non-existent user email!' }
             }
             account = email;
           }
           return account;
    } catch (err) {
        console.log(err);
        return { status: 500, message: 'Internal error, open a ticket, or re-try later' }
    }
  }
    return {
        updateHidenCharacterInDB,
        deleteCharacter,
        updateCharacterCommentInDB,
        checkNameAndEmail,
        checkIfExixtsNameOrEmailOrBothAndReturnAccount
    }
}