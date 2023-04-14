const { worlds, players, products, accounts, payments } = require('../../../models/projectModels');
const { userSockets, io } = require('../../../../../server');
const { projectMailer } = require('../../../utils/utilities');


const insertNewStripesPayment = async (data) => {
  console.log('kd data? ', data)
  try {
    await payments.query().insert(data);
    return { status: 201, message: 'Created new payment' }
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

module.exports = {
  insertNewStripesPayment
}