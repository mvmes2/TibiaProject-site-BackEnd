require('dotenv').config();

module.exports = app => {
    const { CreatePixPayment, ReturnPixNotificationService } = app.src.main.modules.mercadoPago.services.MercadoPagoServices;

    const MercadoPagoPixController = async (req, res) => {
    const resp = await CreatePixPayment()
    res.status(resp.status).send({data: resp.data});
}

const MercadoPagoPixNotificationController = async (req, res) => {
    const data = req.body
    const resp = await ReturnPixNotificationService(data)
    res.status(resp.status).send({data: resp.message});
}
    return {
        MercadoPagoPixController,
        MercadoPagoPixNotificationController
    }
}