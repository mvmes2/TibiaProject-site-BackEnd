require('dotenv').config();
const fs = require('fs');
const util = require('util');
const { generateExpirationDateMinutsFromNowIsoFormat } = require('../../../utils/utilities');

const { api } = require('./api');
module.exports = app => {
  const { insertNewPayment, updatePayment, deleteCancelledPayment, insertCoinsAtAccountToApprovedPayment } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;

  let GLOBAL_USER_DATA_TO_PAYMENT = null;

  const headers = {
    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
  }
  
  const CreatePixPayment = async (data) => {
    let respuest = { status: 500, message: 'Internal error at payment!' };
    try {
    const body = {
      date_of_expiration: generateExpirationDateMinutsFromNowIsoFormat(30),
      payment_method_id: 'pix',
      transaction_amount: data.value,
      description: data.product_name,
      notification_url: `${process.env.BASE_URL_IP}/mercado-pago-pix/notification`,
      statement_descriptor: 'Tibia Project',
      payer: {
        first_name: data.name,
        email: data.email,
      },
      metadata: {
        order_id: data.order_id === 0 ? 1 : (Number(data.order_id) + 1),
        products: [
          {
            id: data.order_id === 0 ? 1 : (Number(data.order_id) + 1),
            title: data.product_name,
            description: 'Virtual coins to be used at www.tibiaProject.com',
            quantity: 1,
            unit_price: data.value
          }
        ]
      }
    };
    
    await api.post('/payments', body, { headers }).then((resp) => {

      // const responseText1 = util.inspect(resp, { depth: null });
      // const responseText2 = util.inspect(resp.data, { depth: null });
      // fs.writeFile('response1.txt', responseText1, (err) => {
      //   if (err) {
      //     console.error('Erro ao escrever arquivo:', err);
      //   } else {
      //     console.log('Arquivo response1.txt foi criado com sucesso.');
      //   }
      // })
      //   fs.writeFile('response2.txt', responseText2, (err) => {
      //     if (err) {
      //       console.error('Erro ao escrever arquivo:', err);
      //     } else {
      //       console.log('Arquivo response2.txt foi criado com sucesso.');
      //     }
      // });

      GLOBAL_USER_DATA_TO_PAYMENT = data;
     return respuest = {status: 201, message: { qr_code: resp.data.point_of_interaction.transaction_data.qr_code_base64, cpy_paste: resp.data.point_of_interaction.transaction_data.qr_code } }
    }).catch((err) => {
      console.log(err);
      return { status: 500, message: 'Internal error at payment!' };
    })

    } catch(err) {
      return { status: 500, message: 'Internal error at payment!' };
    }
    return respuest;
  }

  const ReturnPixNotificationService = async (data) => { 
    try {
      const paymentId = data?.data?.id;

    if (data?.action === 'payment.created' && GLOBAL_USER_DATA_TO_PAYMENT !== null) {
      GLOBAL_USER_DATA_TO_PAYMENT.transaction_id = paymentId
      console.log('paymentCreated: ', paymentId);

      const newPaymentInsert = {
        account_id: GLOBAL_USER_DATA_TO_PAYMENT.account_id,
        account_name: GLOBAL_USER_DATA_TO_PAYMENT.name,
        transaction_id: Number(GLOBAL_USER_DATA_TO_PAYMENT.transaction_id),
        transaction_type: 'pix',
        product_name: GLOBAL_USER_DATA_TO_PAYMENT.product_name,
        unity_value: GLOBAL_USER_DATA_TO_PAYMENT.value,
        total_value: GLOBAL_USER_DATA_TO_PAYMENT.value,
        coins_quantity: GLOBAL_USER_DATA_TO_PAYMENT.coins_quantity,
        fee_percentage: 0.99,
        status: 'pending_payment',
        created_date: Math.floor(Date.now() / 1000),
      }
      insertNewPayment(newPaymentInsert);
      GLOBAL_USER_DATA_TO_PAYMENT = null;
      return { status: 200, message: 'ok' }
    }
    if (data?.action === 'payment.updated') {

      await api.get(`/payments/${paymentId}`, { headers }).then((resp) => {

        if (resp.data.status === 'cancelled') {
          console.log('payment cancelled: ', resp?.data?.id);
          const cancelledID = resp?.data?.id;
          deleteCancelledPayment({transaction_id: cancelledID});
        }

        if (resp.data.status === 'approved') {
          console.log('payment approved: ', resp?.data?.id)
          const approvedID = resp?.data?.id;
          const newUpdate = {
            transaction_id: approvedID,
            update: {
              status: 'approved',
              approved_date: Math.floor(Date.now() / 1000)
            }
          }
          updatePayment(newUpdate);

          setTimeout(async () => {
            await insertCoinsAtAccountToApprovedPayment(approvedID);
          }, 1000);

        }

        return { status: 200, message: 'ok' }

      }).catch((err) => {
        console.log(err);
      })
    }
   
    return { status: 200, message: 'ok' };
    } catch(err) {
      console.log(err);
      return { status: 500, message: 'Internal error' }
    }
  }

  return {
    CreatePixPayment,
    ReturnPixNotificationService
  }
}