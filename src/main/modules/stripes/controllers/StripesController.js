require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPES_ACCESS_KEY);
const express = require('express');
const app = express();
app.use(express.static('public'));
const { generateToken, calculateDiscount } = require('../../../utils/utilities');
const { getPayerByAccountIDFromDB } = require("../../../repository/PayerRepository");
const moment = require('moment-timezone');

module.exports = app => {
  const { StripesinsertNewPaymentService } = app.src.main.modules.stripes.services.StripesServices;
  const { insertCoinsAtAccountToApprovedPayment } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;
  const { getProductsByID } = app.src.main.repository.ProductsRepository;
  const { getCupomByID } = app.src.main.repository.CupomsRepository;

  const StripesCreateCheckoutController = async (req, res) => {
    const data = req.body;

    const checkPayerFirst = await getPayerByAccountIDFromDB(data?.account_id);
		if (checkPayerFirst) {
			if (moment().diff(checkPayerFirst?.buy_time_limit_lock, 'minutes') < 15) {
				return res.status(403).send({ message: 'You have to wait 15 minuts before donate again!' });
			}
		}

    try {

      let cupom = null;

      const productCheck = await getProductsByID({ id: data.product_id });

      if (data?.cupom_id) {
        cupom = await getCupomByID({ id: data?.cupom_id });
      }
      console.log(productCheck?.data?.unity_value)
      console.log(cupom?.data?.discount_percent_limit)
      console.log(calculateDiscount(productCheck?.data?.unity_value, cupom?.data?.discount_percent_limit));
      
      data.unity_value = data?.cupom_id && data?.cupom_id == 2 ? calculateDiscount(productCheck?.data?.unity_value, cupom?.data?.discount_percent_limit) : productCheck?.data?.unity_value;

      console.log(' O que ta vindo de data no stripes? ', data);

      const dataToTokenIfSuccess = {
        account_id: data.account_id,
        account_name: data.name,
        account_email: data.email,
        transaction_type: 'creditCard',
        payment_currency: data.currency,
        payment_company: 'Stripes',
        product_name: data.product_name,
        unity_value: data.unity_value,
        total_value: (Number(data.unity_value) * Number(data.exchangeRate)),
        coins_quantity: data.coins_quantity,
        fee_percentage: data.currency === 'BRL' ? 5 : 6.5,
        status: 'approved',
        created_date: Math.floor(Date.now() / 1000),
        approved_date: Math.floor(Date.now() / 1000)
      }

      const product = await stripe.products.create({ name: data.product_name });
      const newObjToPay = {
        ...dataToTokenIfSuccess,
        transaction_id: product.id
      }

      const token = generateToken(10, newObjToPay);


      console.log(' o que ta vindo do product criado? ', product)
      console.log(' como ficou o order id? ? ', newObjToPay.transaction_id)

      console.log('valor convertido: ', ((Math.ceil((Number(data.unity_value) * Number(data.exchangeRate)))) * 100))

      const price = await stripe.prices.create({
        product: product.id,
        unit_amount: (Math.ceil(((Number(data.unity_value) * Number(data.exchangeRate)) * 100))),
        currency: data.currency.toLowerCase(),
      });
      console.log(price);
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
            price: price.id,
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.BASE_URL_IP_FRONT}/success/stripes/${token}`,
        cancel_url: `${process.env.BASE_URL_IP_FRONT}/donation/type/credit-card?/${data.account_id}`,
      });

      res.status(200).json({ url: session.url });
    } catch (err) {
      console.log(err)
      res.status(500).send('internal error');
    }
  };

  const StripesinsertNewPaymentController = async (req, res) => {
    const data = req.body;
    console.log('data no stripes controller: ', data)
    const resp = await StripesinsertNewPaymentService(data);
    res.status(resp.status).send({ message: resp.message });
  }

  const StrpesInsertCoinsToApprovedPayment = async (req, res) => {
    const data = req.body;
    const resp = await insertCoinsAtAccountToApprovedPayment(data);
    res.status(resp.status).send({ message: resp.message });
  }


  return {
    StripesCreateCheckoutController,
    StripesinsertNewPaymentController,
    StrpesInsertCoinsToApprovedPayment
  }
}