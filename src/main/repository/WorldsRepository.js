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

module.exports = {
  getWorldListFromDB,
  getAllWorldsCharactersFromDB
}