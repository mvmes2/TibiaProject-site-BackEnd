const { players_online } = require('../models/MasterModels');
module.exports = app => {
    const getPlayersOnline = async () => {
        const getPlayersOnlineResponse = await players_online.query().select('player_id');
    return { status: 200, data: getPlayersOnlineResponse};
}
    return {
        getPlayersOnline,
    }
}