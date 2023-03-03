const { worlds } = require('../models/projectModels');

const getWorldListFromDB = async () => {
  try {
    const worldList = await worlds.query().select('*');
    return { status: 200, message: worldList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Erro interno, contate Administração!' }
  }
}

module.exports = {
  getWorldListFromDB
}