require('dotenv').config();
const fs = require('fs');
const util = require('util');

module.exports = app => {
  const moment = require('moment');

  const { CreatePixPayment, ReturnPixNotificationService } = app.src.main.modules.mercadoPago.services.MercadoPagoServices;
  const { getProductsList, GetPaymentListLastIDRepository } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;

  const MercadoPagoPixCreatePaymnentController = async (req, res) => {
    const data = req.body;
    const resp = await CreatePixPayment(data);
    res.status(resp.status).send({ message: resp.message });
  }

  const MercadoPagoPixNotificationController = async (req, res) => {

    // const responseText2 = util.inspect(req.headers, { depth: null });
    //   fs.writeFile('response3.txt', responseText2, (err) => {
    //     if (err) {
    //       console.error('Erro ao escrever arquivo:', err);
    //     } else {
    //       console.log('Arquivo response3.txt foi criado com sucesso.');
    //     }
    //   })
    
    const data = req.body
    const resp = await ReturnPixNotificationService(data)
    res.status(resp.status).send({ data: resp.message });
  }

  let ProductsListLastUpdated = 0;
  let ProductsList = 0;

  const MercadoPagoGetProductsListController = async (req, res) => {

    if (moment().diff(ProductsListLastUpdated, 'minutes') < 5) {
			console.log('cache ProductsList feito com sucesso!');
			return res.status(ProductsList.status).send({ message: ProductsList.message });
		}

    ProductsListLastUpdated = moment();
    ProductsList = await getProductsList();
    
    res.status(ProductsList.status).send({ message: ProductsList.message });
  }

  const MercadoPagoGetPaymentListLastIDController = async (req, res) => {
    const resp = await GetPaymentListLastIDRepository()
    res.status(resp.status).send({ message: resp.message });
  }

  return {
    MercadoPagoPixCreatePaymnentController,
    MercadoPagoPixNotificationController,
    MercadoPagoGetProductsListController,
    MercadoPagoGetPaymentListLastIDController
  }
}