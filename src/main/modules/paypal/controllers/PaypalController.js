require('dotenv').config();
const { generateToken } = require('../../../utils/utilities');
const { paypalApi, paypalApiGetToken } = require('../../../utils/utilities');
const { api } = require('../api');

//Controlador do paypal será usado para o checkoutPRO do mercado pago tendo em vista que nao iremos mais utilizar do paypal por enquanto
// para nao ter que refazer o fluxo de pagamento, iremos aproveitar o modulo paypal inteiro!

module.exports = app => {
	const { insertNewPayment,
		insertCoinsAtAccountToApprovedPayment } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;


	const PagseguroCreatePaymnentController = async (req, res) => {

		const headers = {
			'Accept': 'application/json',
			'Content-type': 'application/json',
			'Authorization': `Bearer ${process.env.PAG_SEGURO_ACCESS_TOKEN}`
		}

		const dataFront = req.body;
		console.log('dataaa: ', dataFront)
		// const dataToTokenIfSuccess = {
		// 	account_id: data.account_id,
		// 	account_name: data.name,
		// 	account_email: data.email,
		// 	transaction_type: 'paypal',
		// 	payment_currency: data.currency,
		// 	payment_company: 'Paypal',
		// 	product_name: data.product_name,
		// 	unity_value: data.value,
		// 	total_value: data.value,
		// 	coins_quantity: data.coins_quantity,
		// 	fee_percentage: 7.0,
		// 	status: 'approved',
		// 	created_date: Math.floor(Date.now() / 1000),
		// 	approved_date: Math.floor(Date.now() / 1000)
		// }

		console.log('qual unity price? ', Number(dataFront.value))

		const data = {
			reference_id: 'teste',
			customer: {
				// name: dataFront.name,
				name: 'garry boina verde',
				email: 'garry@sandbox.pagseguro.com.br',
				tax_id: '39115973808',
				phone: {
					country: '55',
					area: '11',
					number: '959579097'
				}
			},
			items: [{
				reference_id: dataFront.product_name,
				name: dataFront.product_name,
				quantity: 1,
				unit_amount: (Number(dataFront.value) * 100)
			}],
			additional_amount: 0,
			discount_amount: 0,
			payment_methods:[
        {
            type: "credit_card",
        },
    ],
    payment_methods_configs: [
        {
            type: "credit_card",
            brands: ["mastercard"],
            config_options: [
                {
                    option: "installments_limit",
                    value: "5"
                }
            ]
        }
    ],
			soft_descriptor: 'TibiaProject',
			redirect_url: `${process.env.BASE_URL_IP_FRONT}`,
			notification_urls: [
				`${process.env.BASE_URL_IP_BACK}/pagseguro-notification-url`
    ]
		};

		api.post(`/checkouts`, data, { headers }).then((resp) => {
			console.log('resp do create preference mercado pago api pro: ', resp, resp.data.links);
		}).catch((err) => {
			console.log('erro na create preference mercado pago api pro: ', JSON.stringify(err), err?.response?.data?.error_messages);
		});

	};

	const PagSeguroNotificationReceiverController = async (req, res) => {
		console.log('NOTIFICAÇÃO CHEGANDOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO..............: ', req);

	};

	return {
		PagseguroCreatePaymnentController,
		PagSeguroNotificationReceiverController
	}
}