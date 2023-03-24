const { worlds, players, products, accounts, mercado_pago_payments } = require('../../../models/projectModels');
const { userSockets, io } = require('../../../../../server');
const { projectMailer } = require('../../../utils/utilities');


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
    return { status: 200, message: paymentListLastId };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const insertNewPayment = async (data) => {
  try {
    await mercado_pago_payments.query().insert(data);
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const updatePayment = async (data) => {
  try {
    await mercado_pago_payments.query().update(data.update).where({ transaction_id: Number(data.transaction_id) });
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const deleteCancelledPayment = async (data) => {
  try {
    await mercado_pago_payments.query().delete().where({ transaction_id: Number(data.transaction_id) });
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const insertCoinsAtAccountToApprovedPayment = async (paymentID) => {
  console.log('consolando paymentID pra inserção de coins: ', paymentID);
  try {
    const getAccountToInsertCoins = await mercado_pago_payments.query().select('account_id', 'coins_quantity', 'account_email', 'account_name')
      .where({ transaction_id: Number(paymentID) })
      .whereNotNull('approved_date');

    if (!getAccountToInsertCoins || getAccountToInsertCoins === undefined || getAccountToInsertCoins === null || getAccountToInsertCoins?.length < 1) {
      throw new Error('Payment ID do not exists!')
    } else {
      const accToPay = getAccountToInsertCoins[0];
      const getPreviousAmmountToSumm = await accounts.query().select('coins').where({ id: accToPay.account_id }).first();
      console.log('como ta vindo os coins antes? ', getPreviousAmmountToSumm)
      console.log('quanto vai dar a brincadeira atual? ', (Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity)))
      await accounts.query().update({ coins: (Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity)) }).where({ id: accToPay.account_id });
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