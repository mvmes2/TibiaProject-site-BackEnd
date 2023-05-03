const { worlds, players } = require('../models/projectModels');

const getWorldListFromDB = async () => {
  try {
    const worldList = await worlds.query().select('*');
    return { status: 200, message: worldList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const getAllWorldsCharactersFromDB = async () => {
  try {
    const charlist = await players.query().select('name').where('group_id', '<', 4);

    return { status: 200, message: JSON.stringify(charlist) };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const getWorldWideTopFivePlayersRepository = async () => {
  try {
    const topFivePlayers = await players.query()
  .join('worlds', 'players.world_id', '=', 'worlds.id')
  .join('accounts', 'players.account_id', '=', 'accounts.id')
  .select('players.name', 'players.level', 'worlds.serverName as world', 'accounts.country')
  .where('group_id', '<', 4)
  .orderBy('players.level', 'desc').limit(5);
  return { status: 200, message: topFivePlayers }
  } catch (err) {
    console.log('erro ao tentar pegar os top 5 players em: getWorldWideTopFivePlayersRepository ', err);
    return { status: 500, message: 'internal error' }
  }
}

const getAllPlayersFromWorld = async (data) => {
  try {
    const charlist = await players.query().select('id', 'name').where({ world_id: data.world_id }).where('group_id', '<', 4);

    return { status: 200, message: JSON.stringify(charlist) };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

module.exports = {
  getWorldListFromDB,
  getAllWorldsCharactersFromDB,
  getWorldWideTopFivePlayersRepository,
  getAllPlayersFromWorld
}