const { players, players_comment } = require('./../models/projectModels');
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
    return {
        updateHidenCharacterInDB,
        deleteCharacter,
        updateCharacterCommentInDB
    }
}