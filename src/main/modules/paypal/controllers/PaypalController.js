require('dotenv').config();
const { generateToken } = require('../../../utils/utilities');
const { paypalApi, paypalApiGetToken } = require('../../../utils/utilities');
const { api } = require('../api');
const util = require('util');

//Controlador do paypal será usado para o checkoutPRO do mercado pago tendo em vista que nao iremos mais utilizar do paypal por enquanto
// para nao ter que refazer o fluxo de pagamento, iremos aproveitar o modulo paypal inteiro!

module.exports = app => {
	const { insertNewPayment,
		insertCoinsAtAccountToApprovedPayment, updatePayment } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;

	function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}

	let userDataToPay = null;

	const PagseguroCreatePaymnentController = async (req, res) => {
		try {
			const headers = {
				'Accept': 'application/json',
				'Content-type': 'application/json',
				'Authorization': `Bearer ${process.env.PAG_SEGURO_ACCESS_TOKEN}`
			}

			const dataFront = req.body;

			const data = {
				reference_id: dataFront.order_id,
				customer: {
					name: dataFront.name,
					email: dataFront.email,
				},
				items: [{
					reference_id: dataFront.order_id,
					name: dataFront.product_name,
					quantity: 1,
					unit_amount: (Number(dataFront.value) * 100)
				}],
				additional_amount: 0,
				discount_amount: 0,
				payment_methods: [
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
								value: "12"
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

			const redirect = [];

			await api.post(`/checkouts`, data, { headers }).then((resp) => {
				console.log('logando response pagSeguro para homo!!!  ', util.inspect(resp.data, { depth: 2, colors: true }))

				userDataToPay = dataFront;
				userDataToPay = {
					...userDataToPay,
					chekcoutId: resp?.data?.id
				}
				resp?.data?.links.map((item) => {
					if (item?.rel === 'PAY') {
						return redirect.push(item);
					}
				});
			}).catch((err) => {
				console.log('erro na create preference mercado pago api pro: ', err);
			});

			return res.status(200).send({ data: redirect[0]?.href });

		} catch (err) {
			console.log('Error ao tentar criar checkout, ', err);
			return res.status(500).send({ message: 'Internal error!' });
		}
	};

	const PagSeguroNotificationReceiverController = async (req, res) => {
		try {
			// console.log('Vamos ver o que vem dentro da req, para proteger o back de chamdas indevidas! ', util.inspect(req, { depth: 2, colors: true }));
			console.log('o que costuma vir em userAgent do pagseguro? ', req.headers['user-agent'])
			// console.log('o que tem dentro de connection? ', req.headers['connection'])
			// console.log('o que tem dentro de host? ', req.headers['x-product-origin'])
			// console.log('o que tem dentro de authenticity? ', req.headers['x-authenticity-token'])

			if (req.headers['x-product-origin'] !== 'CHECKOUT' || !req.headers['x-product-id'].includes('CHEC_') || req.headers['user-agent'] !== 'Go-http-client/2.0' || !req.headers['x-authenticity-token']) {
				console.log('não autorizado a entrar nesta rota de notification do pagSeguro!! algo de errado com a veracidade da requisição! function PagSeguroNotificationReceiverController')
				return res.status(403).send({ message: 'Erro ao checar a validade da requisição!' });
			}

			const consumerData = req.body;
			console.log('o que vem de update?', consumerData);

			if (Number(consumerData?.reference_id) === Number(userDataToPay?.order_id)) {

				const payLink = consumerData.links.find(link => link.rel === 'PAY');
				let orderId

				if (payLink) {
					// Use uma expressão regular para extrair o ID da ordem
					const orderIdMatch = payLink.href.match(/(ORDE_[A-Z0-9\-]+)/);
					if (orderIdMatch && orderIdMatch[1]) {
						orderId = orderIdMatch[1];
						console.log(orderId);
					}
				}
				console.log(' o que temos em payLink: ', orderId);
				console.log(' o que temos em consumerData.id: ', consumerData.id);
				if (orderId == consumerData.id) {
					console.log('Estamos seguros pra inserir o pagamento na tabela de payments, e fazer a consulta se esta ok para poder atualizar para (pago)');

					const userObjToInsert = {
						account_id: userDataToPay.account_id,
						account_name: userDataToPay.name,
						account_email: userDataToPay.email,
						transaction_id: userDataToPay.chekcoutId,
						transaction_type: 'creditCard',
						payment_currency: 'BRL',
						payment_company: 'PagSeguro',
						product_name: userDataToPay.product_name,
						unity_value: userDataToPay.value,
						total_value: userDataToPay.value,
						coins_quantity: userDataToPay.coins_quantity,
						fee_percentage: 6.0,
						status: 'pending_payment',
						created_date: Math.floor(Date.now() / 1000),
					}
					console.log('como ta vindo charges? ', consumerData.charges[0].status);
					if (consumerData.charges[0].status == 'PAID') {
						await insertNewPayment(userObjToInsert);

						console.log('Pagamento inserido na tabela como pendente, vamos verificar com o pagSeguro se o pagamento realmente foi pago!')

						const headers = {
							'Accept': 'application/json',
							'Content-type': 'application/json',
							'Authorization': `Bearer ${process.env.PAG_SEGURO_ACCESS_TOKEN}`
						}

						await sleep(1000);
						await api.get(`/checkouts/${userObjToInsert.transaction_id}`, { headers }).then(async (resp) => {
							console.log('Vamos ver como vem a resp da consulta ao pagamento: ', resp.data);
							const ordersCheck = [];

							resp.data.orders.forEach(order => {
								ordersCheck.push(order);
							});

							console.log('vamos ver o que vem de status: ', resp.data.status);
							console.log('vamos ver o que vem de id: ', resp.data.id)
							console.log('vamos ver o que vem de id do usrObj: ', userObjToInsert.transaction_id)
							if (resp.data.status == 'ACTIVE' && resp.data.id == userObjToInsert.transaction_id) {
								console.log('deu')

								const dataUpdatePayment = {
									transaction_id: userObjToInsert.transaction_id,
									update: {
										approved_date: Math.floor(Date.now() / 1000),
										status: 'approved'
									}
								}

								await updatePayment(dataUpdatePayment);

								await sleep(1000);

								await insertCoinsAtAccountToApprovedPayment(resp.data.id, consumerData?.customer?.email);
							}
						}).catch((err) => {
							console.log('erro ao tentar confirmar o pagamento com o pagSeguro: ', err);
							return res.status(200).send({ message: 'ok' });
						});
					} else {
						console.log('Pagamento não aprovado!')
						return res.status(403).send({ message: 'Pagamento não aprovado!' });
					}
				} else {
					return res.status(403).send({ message: 'Erro ao validar o pagamento! pagamento não pertence a ordem de pagamento gerada!' });
				}
			}
			return res.status(200).send({ message: 'ok' });
		} catch (err) {
			console.log('Error ao receber pagSeguro notification, ', err);
			return res.status(500).send({ message: 'Internal error!' });
		}
	};



	return {
		PagseguroCreatePaymnentController,
		PagSeguroNotificationReceiverController
	}
}