const { worlds, players, products, accounts, mercado_pago_payments } = require('../../../models/projectModels');

const getProductsList = async () => {
  try {
    const productsList = await products.query().select('*');
    return { status: 200, message: productsList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const GetPaymentListLastIDRepository = async () => {
  try {
    const paymentListLastId = await mercado_pago_payments.query().select('id').orderBy('id', 'desc').first();
    console.log('last man ', paymentListLastId)
    return { status: 200, message: paymentListLastId };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}


module.exports = {
  getProductsList,
  GetPaymentListLastIDRepository
}