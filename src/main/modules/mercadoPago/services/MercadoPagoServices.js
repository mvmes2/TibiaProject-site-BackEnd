require('dotenv').config();
const util = require('util');

const { api } = require('./api');
module.exports = app => {

  const CreatePixPayment = async (data) => {
    const expirationDate = new Date();
    expirationDate.setMinutes(expirationDate.getMinutes() + 5);
    const expirationDateString = expirationDate.toISOString();

    console.log('logando payment service: ', data);
    const body = {
      payment_method_id: 'pix',
      transaction_amount: data.value,
      description: `Tibia Project - ${data.product_name}`,
      notification_url: `${process.env.BASE_URL_IP}:3333/mercado-pago-pix/notification`,
      statement_descriptor: 'Tibia Project Coins pack',
      payer: {
        first_name: data.name,
        email: data.email,
      },
      metadata: {
        order_id: data.order_id ? (Number(data.order_id) + 1) : 1,
        products: [
          {
            id: data.order_id ? (Number(data.order_id) + 1) : 1,
            title: data.product_name,
            description: 'Virtual coins to be used at www.tibiaProject.com',
            quantity: 1,
            unit_price: data.value
          }
        ]
      }
    };
    const headers = {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
    }

    await api.post('/payments', body, { headers }).then((resp) => {
      console.log('log do resp qrCode', util.inspect(resp.data, { depth: null }));
      console.log('log do resp qrCode', util.inspect(resp.data.point_of_interaction.transaction_data.qr_code_base64, { depth: null }));
    }).catch((err) => {
      console.log(err);
    })


    return { status: 200, message: 'ok' };
  }

  const ReturnPixNotificationService = async (data) => { 
    console.log('consolando data da response de retorno no service: ', data);
    const headers = {
      Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
    }
    const paymentId = data?.data?.id;
    if (data?.action === 'payment.updated') {
      await api.get(`/payments/${paymentId}`, { headers }).then((resp) => {
        console.log(JSON.stringify(resp.data.status));
        return { status: 201, message: 'created' }
      }).catch((err) => {
        console.log(err);
      })
    }
   
    return { status: 200, message: 'ok' };
  }

  return {
    CreatePixPayment,
    ReturnPixNotificationService
  }
}