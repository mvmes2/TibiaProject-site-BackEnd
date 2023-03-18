require('dotenv').config();

module.exports = app => {
  const { CreatePixPayment, ReturnPixNotificationService } = app.src.main.modules.mercadoPago.services.MercadoPagoServices;
  const { getProductsList, GetPaymentListLastIDRepository } = app.src.main.modules.mercadoPago.repository.MercadoPagoRepository;

  const MercadoPagoPixCreatePaymnentController = async (req, res) => {
    const data = req.body;
    const resp = await CreatePixPayment(data);
    res.status(resp.status).send({ message: resp.data });
  }

  const MercadoPagoPixNotificationController = async (req, res) => {
    const data = req.body
    const resp = await ReturnPixNotificationService(data)
    res.status(resp.status).send({ data: resp.message });
  }

  const MercadoPagoGetProductsListController = async (req, res) => {
    console.log('oxi')
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