const authMiddleware = require('../middlewares/AuthMiddleware');
const AdminAuthMiddleware = require('../middlewares/AdminAuthMiddleware');
const multer = require('multer');
const { upload, compressImagesMiddleware } = require('./multerConfig');

module.exports = app => {
    app.route('/teste').get(app.src.main.controllers.PrismicController.TesteRequest);
    app.route('/news').get(app.src.main.controllers.PrismicController.ListNews);
    app.route('/news/:id').get(app.src.main.controllers.PrismicController.GetUniqueNews);
    app.route('/archive-news/:page').get(app.src.main.controllers.PrismicController.ListAllNews);
    app.route('/news-tickers').get(app.src.main.controllers.PrismicController.ListNewsTickers);
    app.route('/create-acc').post(app.src.main.controllers.CreateAccController.CreateAccRequest);
    app.route('/log-in').post(app.src.main.controllers.LoginAccController.LoginAccRequest);
    app.route('/acc-validation').post(app.src.main.controllers.AccountController.validateAccountRequest);
    app.route('/getWorld-list').get(app.src.main.controllers.WorldsController.getWorldListRequest);
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
    app.route('/pagseguro-create-payment').post(authMiddleware, app.src.main.modules.pagSeguro.controllers.PagSeguroController.PagseguroCreatePaymnentController);
    app.route('/pagseguro-notification-url').post(app.src.main.modules.pagSeguro.controllers.PagSeguroController.PagSeguroNotificationReceiverController);
    app.route('/getHighScores-players').post(app.src.main.controllers.AccountController.getlAllPlayersToHighscoreController);
    app.route('/getTicketList').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketListRequest);
    app.route('/createNewTicket').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.CreateNewTicket);
    app.route('/getTicket').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketRequest);
    app.route('/User-ticket-update').post(authMiddleware, app.src.main.controllers.TicketsController.UserTicketUpdateRequest);
    app.route('/User-ticket-insert-new-response').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.UserTicketInsertNewResponseRequest);
    app.route('/User-update-account-password').post(authMiddleware, app.src.main.controllers.AccountController.updateAccountPasswordRequest);
    app.route('/User-get-top-five-players').get(app.src.main.controllers.WorldsController.getWorldWideTopFivePlayersRequest);
    app.route('/User-get-character-titles').post(app.src.main.controllers.AccountController.getCharacterTitlesRequest);
    app.route('/User-update-character-title').post(authMiddleware, app.src.main.controllers.AccountController.updateCharacterTitleInUseRequest);
    app.route('/User-get-guildList').get(app.src.main.controllers.GuildsController.GetGuildListRequest);
    app.route('/User-get-characterList').post(authMiddleware, app.src.main.controllers.AccountController.getCharacterListFromAccountRequest);
    app.route('/User-get-guildInformations').post(app.src.main.controllers.GuildsController.GetGuildInformationsRequest);
    app.route('/User-accept-guild-invitation').post(authMiddleware, app.src.main.controllers.GuildsController.GetGuildAcceptInvitationRequest);
    app.route('/User-remove-player-from-guild').post(authMiddleware, app.src.main.controllers.GuildsController.GuildOnDeleteCharRequest);
    app.route('/User-get-AllWorld-Players').post(authMiddleware, app.src.main.controllers.WorldsController.getAllPlayersFromWorldRequest);
    app.route('/User-invite-newPlayer').post(authMiddleware, app.src.main.controllers.GuildsController.newGuildInviteRequest);
    app.route('/User-guild-invite-cancel').post(authMiddleware, app.src.main.controllers.GuildsController.guildInviteCancelRequest);
    app.route('/User-guild-update-member').post(authMiddleware, app.src.main.controllers.GuildsController.guildUpdateMemberRequest);
    app.route('/User-guild-createNew-rank').post(authMiddleware, app.src.main.controllers.GuildsController.guildCreateNewRankRequest);
    app.route('/User-guild-changeRank-name').post(authMiddleware, app.src.main.controllers.GuildsController.guildChangeRankNameRequest);
    app.route('/User-guild-deleteRank').post(authMiddleware, app.src.main.controllers.GuildsController.guildDeleteRankRequest);
    app.route('/User-get-accountInfo').post(authMiddleware, app.src.main.controllers.AccountController.getInfoFromAccountRequest);
    app.route('/User-guild-createGuild').post(authMiddleware, app.src.main.controllers.GuildsController.createNewGuildRequest);
    app.route('/User-players-quantity').get(app.src.main.controllers.AccountController.getPlayerQuantity);
    app.route('/twitch/get-lives').get(app.src.main.modules.twitch.controllers.TwitchApiController.twitch);
    app.route('/twitch/get-official-streamers').get(app.src.main.modules.twitch.controllers.TwitchApiController.getOfficialStreamersChannelInfo);
    
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
    app.route('/Admin/insert-new-streamer').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminInsertNewStreamer);
    

    
    //////Error MiddleWare/////
    app.use((err, req, res, next) => {
        if (err instanceof multer.MulterError || err.message === 'Invalid file type. Only JPEG and PNG files are allowed.') {
          return res.status(400).json({ error: err.message });
        }
      
        next(err);
      });
}