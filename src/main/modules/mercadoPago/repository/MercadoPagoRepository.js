const { worlds, players } = require('../../../models/projectModels');

const getWorldListFromDB = async () => {
  try {
    const worldList = await worlds.query().select('*');
    return { status: 200, message: worldList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}


module.exports = {
  getWorldListFromDB,
}