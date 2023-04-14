require('dotenv').config();
const { generateToken } = require('../../../utils/utilities');
const { paypalApi, paypalApiGetToken } = require('../../../utils/utilities');

module.exports = app => {
	const { insertNewPayment,
		insertCoinsAtAccountToApprovedPayment } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;


	const PaypalCreatePaymnentController = async (req, res) => {
		const data = req.body;
		console.log('dataaa: ', data)
		const dataToTokenIfSuccess = {
			account_id: data.account_id,
			account_name: data.name,
			account_email: data.email,
			transaction_type: 'paypal',
			payment_currency: data.currency,
			payment_company: 'Paypal',
			product_name: data.product_name,
			unity_value: data.value,
			total_value: data.value,
			coins_quantity: data.coins_quantity,
			fee_percentage: 7.0,
			status: 'approved',
			created_date: Math.floor(Date.now() / 1000),
			approved_date: Math.floor(Date.now() / 1000)
		}
		const token = generateToken(10, dataToTokenIfSuccess);

		const order = {
			intent: 'CAPTURE',
			purchase_units: [
				{
					amount: {
						currency_code: "BRL",
						value: `${data.value}`
					},
					description: data.product_name,
				}
			],
			application_context: {
				brand_name: "tibiaproject.com",
				landing_page: "LOGIN",
				user_action: "PAY_NOW",
				return_url: `${process.env.BASE_URL_IP_FRONT}/success/paypal/${token}`,
				cancel_url: `${process.env.BASE_URL_IP_FRONT}/donation/type/paypal?/`
			}
		};

		const params = new URLSearchParams();
		params.append("grant_type", "client_credentials");


		const { data: { access_token } } = await paypalApi.post('/v1/oauth2/token', params, {
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			auth: {
				username: process.env.PAYPAL_USER_ID,
				password: process.env.PAYPAL_USER_PASSWORD
			}
		});

		const response = await paypalApi.post('/v2/checkout/orders', order, {
			headers: {
				Authorization: `Bearer ${access_token}`,
			}
		});

		console.log(response.data)
		const transaction_id = response.data.id;
		const approveLink = response.data.links.filter((item) => item.rel === 'approve')[0].href

		res.status(201).send({ message: { url: approveLink, transaction_id: transaction_id } });
	};

	const PaypalCaptureAndCompletePayment = async (req, res) => {
		try {
			const data = req.body;
			console.log(data);
			const response = await paypalApi.post(`/v2/checkout/orders/${data.transaction_id}/capture`,
				{},
				{
					auth: {
						username: process.env.PAYPAL_USER_ID,
						password: process.env.PAYPAL_USER_PASSWORD
					}
				}
			).then(() => {
				try {
					insertNewPayment(data);
					setTimeout(async () => {
					insertCoinsAtAccountToApprovedPayment(data.transaction_id);
					res.status(201).send({ message: 'ok' })
					}, 1000);
				} catch (err) {
					console.log(err);
					res.status(404).send({ message: 'Error at validating your payment' });
				}
			}).catch((err) => {
				console.log(err);
			res.status(404).send({ message: 'Error at validating your payment' });
			});
		} catch (err) {
			console.log(err);
			res.status(404).send({ message: 'Error at validating your payment' });
		}
		
	};

	return {
		PaypalCreatePaymnentController,
		PaypalCaptureAndCompletePayment
	}
}