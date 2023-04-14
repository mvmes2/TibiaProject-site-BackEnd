require('dotenv').config();
const fs = require('fs');
const util = require('util');

module.exports = app => {
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

  const MercadoPagoGetProductsListController = async (req, res) => {
    const resp = await getProductsList()
    res.status(resp.status).send({ message: resp.message });
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