const authMiddleware = require('../middlewares/AuthMiddleware');
const AdminAuthMiddleware = require('../middlewares/AdminAuthMiddleware');
const multer = require('multer');
const { upload, compressImagesMiddleware } = require('./multerConfig');

module.exports = app => {
    app.route('/teste').get(app.src.main.controllers.ServerTestResponseController.TesteRequest);
    app.route('/news').get(app.src.main.controllers.ServerTestResponseController.ListNews);
    app.route('/news-tickers').get(app.src.main.controllers.ServerTestResponseController.ListNewsTickers);
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
    app.route('/getHighScores-players').post(app.src.main.controllers.AccountController.getlAllPlayersToHighscoreController);
    app.route('/getTicketList').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketListRequest);
    app.route('/createNewTicket').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.CreateNewTicket);
    app.route('/getTicketListLastId').get(authMiddleware, app.src.main.controllers.TicketsController.GetTicketListLastIdRequest);
    app.route('/getTicket').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketRequest);
    app.route('/User-ticket-update').post(authMiddleware, app.src.main.controllers.TicketsController.UserTicketUpdateRequest);
    app.route('/User-ticket-insert-new-response').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.UserTicketInsertNewResponseRequest);
    app.route('/User-update-account-password').post(authMiddleware, app.src.main.controllers.AccountController.updateAccountPasswordRequest);
    app.route('/User-get-top-five-players').get(app.src.main.controllers.WorldsController.getWorldWideTopFivePlayersRequest);
    app.route('/User-get-character-titles').post(app.src.main.controllers.AccountController.getCharacterTitlesRequest);
    app.route('/User-update-character-title').post(authMiddleware, app.src.main.controllers.AccountController.updateCharacterTitleInUseRequest);
    app.route('/User-get-guildList').get(app.src.main.controllers.GuildsController.GetGuildListRequest);
    
    
    

    /////////////////////////////////////////////////// Admin Routes //////////////////////////////////////////////////////////

    app.route('/admin-login').post(app.src.main.controllers.AdminController.LoginAdminAccRequest);
    app.route('/validate-token-admin').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminValidateJsonTokenRequest);
    app.route('/AdminGet-ticketList').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdmingetTicketListRequest);
    app.route('/AdminGet-ticket').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetTicketRequest);
    app.route('/Admin-ticket-update').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminTicketUpdateRequest);
    app.route('/Admin-ticket-insert-new-response').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminTicketInsertNewResponseRequest);
    app.route('/Admin-ticket-delete').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminOnDeleteTicketRequest);
    app.route('/Admin-get-client-version').get(AdminAuthMiddleware, app.src.main.controllers.ClientVersionController.GetClientVersionRequest);
    app.route('/Admin-update-client-version').post(AdminAuthMiddleware, app.src.main.controllers.ClientVersionController.UpdateClientVersionRequest);
    
    
    
    
    //////Error MiddleWare/////
    app.use((err, req, res, next) => {
        if (err instanceof multer.MulterError || err.message === 'Invalid file type. Only JPEG and PNG files are allowed.') {
          return res.status(400).json({ error: err.message });
        }
      
        next(err);
      });
}