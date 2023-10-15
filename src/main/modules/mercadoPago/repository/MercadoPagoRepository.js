require('dotenv').config();
const { worlds, players, accounts } = require('../../../models/MasterModels');
const { products , payments } = require('../../../models/SlaveModels');
const { userSockets, io } = require('../../../../../server');
const { projectMailer, getlastPaymentIDUpdated, setlastPaymentIDUpdated, setCreateCharacterController, ErrorLogCreateFileHandler,
  LogCreateFileHandler } = require('../../../utils/utilities');
const moment = require('moment');
const Enums = require('../../../config/Enums');

const { cupoms, redeem_cupom_storage } = require("./../../../models/SlaveModels");

const getProductsList = async () => {
  try {
    const productsList = await products().select('*');
    return { status: 200, message: productsList };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

//cache
let lastPaymentID = 0;

const GetPaymentListLastIDRepository = async () => {

  if (getlastPaymentIDUpdated() !== 0 && moment().diff(getlastPaymentIDUpdated(), 'minutes') < 5) {
    console.log('Cache lastPaymentID aplicado com sucesso!')
    return { status: 200, message: lastPaymentID === undefined ? 1 : (Number(lastPaymentID.id) + 1) };
  }
  try {
    lastPaymentID = await payments().select('id').orderBy('id', 'desc').first();
    setlastPaymentIDUpdated(moment());

    return { status: 200, message: lastPaymentID === undefined ? 1 : (Number(lastPaymentID.id) + 1) };
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error, close the website, and try again, or call Administration!' }
  }
}

const insertNewPayment = async (data) => {
  console.log('ESTAMOS INSERINDO PAGAMENTO!!!!!!!!!!!!!!');
  console.log(data);
  data.transaction_id = data.transaction_id.toString();
  const checkIfPaymentAlreadyExists = await payments().select('transaction_id').where({ transaction_id: data.transaction_id });
  if (checkIfPaymentAlreadyExists.length > 0) {
    console.log('Pagamento ja existe!');
    return { status: 409, message: 'Pagamento já existe!' }
  }
  try {
    await payments().insert(data);
    setlastPaymentIDUpdated(0);
    return { status: 201, message: 'Pagamento criado com sucesso!' }
  } catch (err) {
    console.log(err);
    await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertNewPayment_ERROR_FILE_NAME, '', err);
    return { status: 500, message: 'Internal error!' }
  }
}

const updatePayment = async (data) => {
  try {
    await payments().update(data.update).where({ transaction_id: data.transaction_id.toString() });
  } catch (err) {
    console.log(err);
    await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_updatePayment_ERROR_FILE_NAME, '', err);
    return { status: 500, message: 'Internal error!' }
  }
}

const deleteCancelledPayment = async (data) => {
  try {
    await payments().delete().where({ transaction_id: data.transaction_id.toString() });
  } catch (err) {
    console.log(err);
    return { status: 500, message: 'Internal error!' }
  }
}

const insertCoinsAtAccountToApprovedPayment = async (paymentID, pagseguroEmail, cupom_id) => {
  console.log(' consolando se estamos recebendo email do pagSeguro!! ', pagseguroEmail);
  console.log('consolando paymentID pra inserção de coins: ', paymentID);
  try {
    const getAccountToInsertCoins = await payments().select('account_id', 'coins_quantity', 'account_email', 'account_name', 'product_name')
      .where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() })
      .whereNotNull('approved_date')
      .whereNull('coins_paid_date');

    const accToPay = getAccountToInsertCoins[0];
    const userId = accToPay?.account_id;
    console.log('o que temos dentro do socket??? ', userSockets);
    const userSocketId = userSockets ? userSockets[userId] : '';

    console.log('como estou recebendo o id?', paymentID)
    console.log('qual conta vai vir? ', getAccountToInsertCoins)

    if (getAccountToInsertCoins?.length < 1) {
      try {
        throw new Error('Payment ID do not exists or payment id have already been paid, check your email!')
      } catch (err) {
        const text = 'Error while retrieving account to insert coins, (transaction_id does do not exist at database)';
        await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertCoinsAtAccountToApprovedPayment_InsertCoinsAtAccountToApprovedPayment_ERROR_FILE_NAME, text, err);
        return { status: 409, message: 'Payment ID do not exists or payment id have already been paid, check your email!' }
      }
    }

    /////////////////////////////////////////////////// Founder's Pack.

    else if (accToPay.product_name.includes("Founder's")) {

      try {
        const getPreviousPackNumberAmmountToSumm = await accounts.query().select('silver_pack', 'gold_pack', 'diamond_pack', 'coins').where({ id: accToPay.account_id }).first();

        const packPayFunction = async (packType) => {

          const packToPayAmount = (Number(getPreviousPackNumberAmmountToSumm[packType]) + 1);

          let totalAmount = Number(getPreviousPackNumberAmmountToSumm.coins);
          const getCupom = await cupoms().select('*').where({ id: cupom_id }).first();
          const checkCupomRedeem = await redeem_cupom_storage().select('*').where({ account_id: accToPay.account_id, cupom_id: cupom_id });

          if (getCupom.cupom_name == "TIBIAPAPO" && checkCupomRedeem.length <= 0) {
            totalAmount+= Number(getCupom.coins_quantity);
            console.log('quanto tinha na conta antes do cupom papo?', getPreviousPackNumberAmmountToSumm.coins);
            console.log('quanto vai dar a brincadeira atual com cupom papo? ', totalAmount);
            console.log('O Papao deu certo, conta tem que estar com: ', totalAmount, ' coins!');
          }

          const updateAccountInfo = {
            [packType]: packToPayAmount,
            coins: totalAmount
          }
          console.log('NAO DEU PAPO!!!!!!!!!!!');
          await accounts.query().update(updateAccountInfo).where({ id: accToPay.account_id });
          await payments().update({ coins_paid_date: Date.now() / 1000, status: 'sent' }).where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() });
          if (cupom_id) {
            await redeem_cupom_storage().insert({ account_id: accToPay.account_id, cupom_id });
            await payments().update({ cupom_id }).where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() });
            LogCreateFileHandler("CupomsLogs.txt", `cupom de id: ${cupom_id} inserido com sucesso na Account de id: ${accToPay.account_id}`);
          }
          

          try {
            const link = `${process.env.BASE_URL_IP_FRONT}/founder_guide`;
            console.log('vai enviar email??');
            projectMailer.FounderPackPurchase(accToPay.product_name, accToPay.account_name, accToPay.account_email, link);
            console.log('email de pagamento enviado!');
            if (pagseguroEmail && accToPay.account_email !== pagseguroEmail) {
              console.log('vai enviar email do pagseguro??');
              projectMailer.FounderPackPurchase(accToPay.product_name, accToPay.account_name, pagseguroEmail, link);
              console.log('email PagSeguro de pagamento enviado!');
            }
          } catch (err) {
            console.log('email error at mercadoPagoRepository, insertCoinsAtAccountToApprovedPayment at Email send: ', err)
          }
          console.log('vou continuar e entrar dentro do socket para avisar que foi pago?');
          if (userSocketId) {
            console.log('entrei no socket para emitir aprovação');
            console.log('Emitindo evento de pagamento aprovado para:', userSocketId ? userSockets : '');
            io.to(userSocketId).emit("payment_approved", {
              status: "approved",
              foundersPack: packType
            });
          }
          return { status: 200, message: 'paied' }
        }

        switch (accToPay.product_name) {
          case "Silver Founder's Pack":
            await packPayFunction('silver_pack');
            break
          case "Gold Founder's Pack":
            await packPayFunction('gold_pack');
            break
          case "Diamond Founder's Pack":
            await packPayFunction('diamond_pack');
            break

          default:
            if (process.env?.LOCAL_TEST_DEVELOPMENT_ENV) {
              await packPayFunction('silver_pack');
              const text = `Account name: ${accToPay?.account_name}, AccountID: ${accToPay?.account_id}, Provavelmente pack de teste, ${accToPay.product_name}, Este Founder pack nao existe no banco produção!!`
              await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertCoinsAtAccountToApprovedPayment_InsertFoundersPack_ERROR_FILE_NAME, text, '');
              break
            }
            const text = `Account name: ${accToPay?.account_name}, AccountID: ${accToPay?.account_id}, Provavelmente pack de teste, ${accToPay.product_name}, Este Founder pack nao existe no banco produção!!`
            await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertCoinsAtAccountToApprovedPayment_InsertFoundersPack_ERROR_FILE_NAME, text, '');
            return { status: 404, message: 'You cannot receive a Test founders pack, open ticket to admin at ticket page!' }
        }

      } catch (err) {
        const text = `Account name: ${accToPay?.account_name}, AccountID: ${accToPay?.account_id}, erro ao tentar inserir coin, ${err}`
        await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertCoinsAtAccountToApprovedPayment_InsertPurchasedCoin_ERROR_FILE_NAME, text, '');
        return { status: 500, message: 'Internal error!' }
      }
    }

    else {
      const getPreviousAmmountToSumm = await accounts.query().select('coins').where({ id: accToPay.account_id }).first();

      console.log('como ta vindo os coins antes? ', getPreviousAmmountToSumm)
      console.log('quanto vai dar a brincadeira atual? ', (Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity)));

      let totalAmount = Number(getPreviousAmmountToSumm.coins) + Number(accToPay.coins_quantity);
          const getCupom = await cupoms().select('*').where({ id: cupom_id }).first();
          const checkCupomRedeem = await redeem_cupom_storage().select('*').where({ account_id: accToPay.account_id, cupom_id: cupom_id });
          if (getCupom.cupom_name == "TIBIAPAPO" && checkCupomRedeem.length <= 0) {
            totalAmount+= Number(getCupom.coins_quantity);
            console.log('VAI DAR PAPO quanto vai dar a brincadeira atual com cupom papo? ', totalAmount);
          }
          console.log('NAO DEU PAPO!!!!!!!!!!!');
      await accounts.query().update({ coins: totalAmount }).where({ id: accToPay.account_id });
      await payments().update({ coins_paid_date: Date.now() / 1000, status: 'sent' }).where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() });
      if (cupom_id) {
        await redeem_cupom_storage().insert({ account_id: accToPay.account_id, cupom_id });
        await payments().update({ cupom_id }).where({ transaction_id: !paymentID.id ? paymentID.toString() : paymentID.id.toString() });
        LogCreateFileHandler("CupomsLogs.txt", `cupom de id: ${cupom_id} inserido com sucesso na Account de id: ${accToPay.account_id}`);
      }
      

      try {
        projectMailer.coinsPurchase(accToPay.account_email, accToPay.account_name, accToPay.coins_quantity);
        setCreateCharacterController(0);
        console.log('email de pagamento enviado!');
        if (pagseguroEmail && accToPay.account_email !== pagseguroEmail) {
          projectMailer.coinsPurchase(pagseguroEmail, accToPay.account_name, accToPay.coins_quantity);
          console.log('email PagSeguro de pagamento enviado!');
        }
      } catch (err) {
        console.log('email error at mercadoPagoRepository, insertCoinsAtAccountToApprovedPayment at Email send', err)
      }

      console.log('consolando se tem algo no userSocket ', userSockets ? userSockets : '');
      console.log('logando o id da conta do usuário ao receber o pagamento: ', accToPay?.account_id);

      if (userSocketId) {
        console.log('Emitindo evento de pagamento aprovado para:', userSocketId ? userSockets : '');
        io.to(userSocketId).emit("payment_approved", {
          status: "approved",
        });
      }
      return { status: 200, message: 'paied' }
    }
  } catch (err) {
    const text = `Account name: ${accToPay?.account_name}, AccountID: ${accToPay?.account_id}, Internal error! insertCoinsAtAccountToApprovedPayment function at mercadoPagoRepository, ${err}`
    await ErrorLogCreateFileHandler(Enums.MERCADOPAGOREPOSITORY_insertCoinsAtAccountToApprovedPayment_InsertCoinsAtAccountToApprovedPayment_ERROR_FILE_NAME, text, '');
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