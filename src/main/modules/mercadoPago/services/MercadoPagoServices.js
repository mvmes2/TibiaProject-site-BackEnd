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
      transaction_amount: 1,
      description: 'Compra de exemplo pix',
      notification_url: 'http://143.0.20.85:3333/mercado-pago-pix/notification',
      statement_descriptor: 'Exemplo',
      payer: {
        first_name: 'Test',
        email: 'cliente@exemplo.com.br',
        identification: {
          type: 'CPF',
          number: '19119119100'
        }
      },
      metadata: {
        order_id: 'pedido-001',
        products: [
          {
            id: 'produto-001',
            title: 'Produto de exemplo pix donation',
            description: 'Descrição do produto de exemplo pix donation',
            quantity: 1,
            unit_price: 1
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