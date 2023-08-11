const { worlds, players, products, accounts, payments } = require('../../../models/projectModels');
const { userSockets, io } = require('../../../../../server');
const { projectMailer } = require('../../../utils/utilities');
const moment = require('moment');

const getProductsList = async () => {
  try {
    const productsList = await products.query().select('*');
    return { status: 200, message: productsList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

let lastPaymentIDUpdated = 0;
let lastPaymentID = 0;

const GetPaymentListLastIDRepository = async () => {

  if (lastPaymentIDUpdated != 0 && moment().diff(lastPaymentIDUpdated, 'minutes') < 5) {
    console.log('Cache lastPaymentID aplicado com sucesso!')
    return { status: 200, message: lastPaymentID === undefined  ? {id: 0} : lastPaymentID };
  } 
  try {
    lastPaymentID = await payments.query().select('id').orderBy('id', 'desc').first();
    lastPaymentIDUpdated = moment();

    return { status: 200, message: lastPaymentID === undefined ? {id: 0} : lastPaymentID };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const insertNewPayment = async (data) => {
  console.log(data);
  data.transaction_id = data.transaction_id.toString();
  try {
    await payments.query().insert(data);
    lastPaymentIDUpdated = 0;
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const updatePayment = async (data) => {
  try {
    await payments.query().update(data.update).where({ transaction_id: data.transaction_id.toString() });
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const deleteCancelledPayment = async (data) => {
  try {
    await payments.query().delete().where({ transaction_id: data.transaction_id.toString() });
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const insertCoinsAtAccountToApprovedPayment = async (paymentID) => {
  console.log('consolando paymentID pra inserção de coins: ', paymentID);
  try {
    const getAccountToInsertCoins = await payments.query().select('account_id', 'coins_quantity', 'account_email', 'account_name')
      .where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() })
      .whereNotNull('approved_date')
      .whereNull('coins_paid_date');

      console.log('como estou recebendo o id?', paymentID)
      console.log('qual conta vai vir? vai dar certo? ', getAccountToInsertCoins)

    if (getAccountToInsertCoins?.length < 1) {
      try{
        throw new Error('Payment ID do not exists or payment id have already been paid, check your email!')
      }catch(err){
        console.log(err)
        return { status: 404, message: 'Payment ID do not exists or payment id have already been paid, check your email!' }
      }
    } else {
      const accToPay = getAccountToInsertCoins[0];
      const getPreviousAmmountToSumm = await accounts.query().select('coins').where({ id: accToPay.account_id }).first();
      console.log('como ta vindo os coins antes? ', getPreviousAmmountToSumm)
      console.log('quanto vai dar a brincadeira atual? ', (Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity)));
      await accounts.query().update({ coins: (Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity)) }).where({ id: accToPay.account_id });
      await payments.query().update({ coins_paid_date: Date.now() / 1000 }).where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() });
      try {
        projectMailer.coinsPurchase(accToPay.account_email, accToPay.account_name, accToPay.coins_quantity);
        console.log('email de pagamento enviado!');
      } catch(err) {
        console.log('email error at mercadoPagoRepository: ', err)
      }

      console.log('consolando se tem algo no userSocket ', userSockets ? userSockets : '');
      console.log('logando o id da conta do usuário ao receber o pagamento: ', accToPay?.account_id);
      const userId = accToPay?.account_id;
      const userSocketId = userSockets ? userSockets[userId] : '';

      if (userSocketId) {
        console.log('Emitindo evento de pagamento aprovado para:', userSocketId ? userSockets : '');
        io.to(userSocketId).emit("payment_approved", {
          status: "approved",
        });
      }
      return { status: 200, message: 'paied' }
    }
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}


module.exports = {
  getProductsList,
  GetPaymentListLastIDRepository,
  insertNewPayment,
  updatePayment,
  deleteCancelledPayment,
  insertCoinsAtAccountToApprovedPayment
}