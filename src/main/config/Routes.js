const authMiddleware = require('../middlewares/AuthMiddleware');

module.exports = app => {
    app.route('/teste').get(app.src.main.controllers.ServerTestResponseController.TesteRequest);
    app.route('/create-acc').post(app.src.main.controllers.CreateAccController.CreateAccRequest);
    app.route('/log-in').post(app.src.main.controllers.LoginAccController.LoginAccRequest);
    app.route('/acc-validation').post(app.src.main.controllers.AccountController.validateAccountRequest);
    app.route('/getWorld-list').get(app.src.main.controllers.WorldsController.GetWorldListRequest);
    app.route('/createNewChar').post(app.src.main.controllers.AccountController.createCharacterRequest);
    app.route('/character-validation').post(app.src.main.controllers.AccountController.checkCharacterOwnershipRequest);
    app.route('/character-delete').post(app.src.main.controllers.AccountController.deleteCharacterRequest);
    app.route('/character-updateHidden').post(app.src.main.controllers.AccountController.updateHidenCharacterRequest);
    app.route('/character-updateComment').post(app.src.main.controllers.AccountController.updateCharacterCommentRequest);
    app.route('/getWorldWide-characters').get(app.src.main.controllers.WorldsController.getAllWorldsCharactersRequest);
    app.route('/before-create-acc-email-validation').post(app.src.main.controllers.CreateAccController.beforeAccCreateSendEmailRequest);
    app.route('/update-rk').post(app.src.main.controllers.AccountController.updateRKRequest);
    app.route('/recovery-acc-back-generic').post(app.src.main.controllers.AccountController.recoveryAccountGenericRequest);
    app.route('/get-account-info').post(app.src.main.controllers.AccountController.getAccountInfoRequest);
    app.route('/validate-changePass-token').post(authMiddleware, app.src.main.controllers.AccountController.validateJsonTokenRequest);
    app.route('/validate-token').get(authMiddleware, app.src.main.controllers.AccountController.validateJsonTokenRequest);
    app.route('/mercado-pago-pix/create-payment').post(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoPixCreatePaymnentController);
    app.route('/mercado-pago-pix/notification').post(app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoPixNotificationController);
    app.route('/mercado-pago-pix/get-products').get(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoGetProductsListController);
    app.route('/mercado-pago-pix/get-PaymentList-Last-id').get(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoGetPaymentListLastIDController);
    app.route('/stripes-create-payment').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StripesCreateCheckoutController);
    app.route('/stripes-insert-payment').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StripesinsertNewPaymentController);
    app.route('/stripes-insertCoins').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StrpesInsertCoinsToApprovedPayment);
    app.route('/paypal-create-payment').post(authMiddleware, app.src.main.modules.paypal.controllers.PaypalController.PaypalCreatePaymnentController);
    app.route('/paypal-capture-complete-payment').post(authMiddleware, app.src.main.modules.paypal.controllers.PaypalController.PaypalCaptureAndCompletePayment);
    app.route('/admin-login').post(app.src.main.controllers.AdminController.LoginAdminAccRequest);

    
    
}