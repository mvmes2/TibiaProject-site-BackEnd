const { players_online } = require('./../models/projectModels');
module.exports = app => {
    const getPlayersOnline = async () => {
        const getPlayersOnlineResponse = await players_online.query().select('player_id');
        console.log('respondendo quantidade de player', getPlayersOnlineResponse);
        console.log('respondendo quantidade de player', getPlayersOnlineResponse.length);
    return { status: 200, data: getPlayersOnlineResponse};
}
    return {
        getPlayersOnline,
    }
}