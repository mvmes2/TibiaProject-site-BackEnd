const authMiddleware = require('../middlewares/AuthMiddleware');
const AdminAuthMiddleware = require('../middlewares/AdminAuthMiddleware');
const multer = require('multer');
const { upload, compressImagesMiddleware } = require('./multerConfig');

module.exports = app => {
    app.route('/v1/teste').get(app.src.main.controllers.PrismicController.TesteRequest);
    app.route('/v1/news').get(app.src.main.controllers.PrismicController.ListNews);
    app.route('/v1/news/:id').get(app.src.main.controllers.PrismicController.GetUniqueNews);
    app.route('/v1/archive-news/:page').get(app.src.main.controllers.PrismicController.ListAllNews);
    app.route('/v1/news-tickers').get(app.src.main.controllers.PrismicController.ListNewsTickers);
    app.route('/v1/create-acc').post(app.src.main.controllers.CreateAccController.CreateAccRequest);
    app.route('/v1/log-in').post(app.src.main.controllers.LoginAccController.LoginAccRequest);
    app.route('/v1/acc-validation').post(app.src.main.controllers.AccountController.validateAccountRequest);
    app.route('/v1/getWorld-list').get(app.src.main.controllers.WorldsController.getWorldListRequest);
    app.route('/v1/createNewChar').post(app.src.main.controllers.AccountController.createCharacterRequest);
    app.route('/v1/character-validation').post(app.src.main.controllers.AccountController.checkCharacterOwnershipRequest);
    app.route('/v1/character-delete').post(app.src.main.controllers.AccountController.deleteCharacterRequest);
    app.route('/v1/character-updateHidden').post(app.src.main.controllers.AccountController.updateHidenCharacterRequest);
    app.route('/v1/character-updateComment').post(app.src.main.controllers.AccountController.updateCharacterCommentRequest);
    app.route('/v1/getWorldWide-characters').get(app.src.main.controllers.WorldsController.getAllWorldsCharactersRequest);
    app.route('/v1/before-create-acc-email-validation').post(app.src.main.controllers.CreateAccController.beforeAccCreateSendEmailRequest);
    app.route('/v1/update-rk').post(app.src.main.controllers.AccountController.updateRKRequest);
    app.route('/v1/recovery-acc-back-generic').post(app.src.main.controllers.AccountController.recoveryAccountGenericRequest);
    app.route('/v1/get-account-info').post(app.src.main.controllers.AccountController.getAccountInfoRequest);
    app.route('/v1/validate-changePass-token').post(authMiddleware, app.src.main.controllers.AccountController.validateJsonTokenRequest);
    app.route('/v1/validate-token').get(authMiddleware, app.src.main.controllers.AccountController.validateJsonTokenRequest);
    app.route('/v1/mercado-pago-pix/create-payment').post(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoPixCreatePaymnentController);
    app.route('/v1/mercado-pago-pix/notification').post(app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoPixNotificationController);
    app.route('/v1/mercado-pago-pix/get-products').get(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoGetProductsListController);
    app.route('/v1/mercado-pago-pix/get-PaymentList-Last-id').get(authMiddleware, app.src.main.modules.mercadoPago.controllers.MercadoPagoController.MercadoPagoGetPaymentListLastIDController);
    app.route('/v1/stripes-create-payment').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StripesCreateCheckoutController);
    app.route('/v1/stripes-insert-payment').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StripesinsertNewPaymentController);
    app.route('/v1/stripes-insertCoins').post(authMiddleware, app.src.main.modules.stripes.controllers.StripesController.StrpesInsertCoinsToApprovedPayment);
    app.route('/v1/pagseguro-create-payment').post(authMiddleware, app.src.main.modules.pagSeguro.controllers.PagSeguroController.PagseguroCreatePaymnentController);
    app.route('/v1/pagseguro-notification-url').post(app.src.main.modules.pagSeguro.controllers.PagSeguroController.PagSeguroNotificationReceiverController);
    app.route('/v1/getHighScores-players').post(app.src.main.controllers.AccountController.getlAllPlayersToHighscoreController);
    app.route('/v1/getTicketList').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketListRequest);
    app.route('/v1/createNewTicket').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.CreateNewTicket);
    app.route('/v1/getTicket').post(authMiddleware, app.src.main.controllers.TicketsController.GetTicketRequest);
    app.route('/v1/User-ticket-update').post(authMiddleware, app.src.main.controllers.TicketsController.UserTicketUpdateRequest);
    app.route('/v1/User-ticket-insert-new-response').post(authMiddleware, upload, compressImagesMiddleware, app.src.main.controllers.TicketsController.UserTicketInsertNewResponseRequest);
    app.route('/v1/User-update-account-password').post(authMiddleware, app.src.main.controllers.AccountController.updateAccountPasswordRequest);
    app.route('/v1/User-get-top-five-players').get(app.src.main.controllers.WorldsController.getWorldWideTopFivePlayersRequest);
    app.route('/v1/User-get-character-titles').post(app.src.main.controllers.AccountController.getCharacterTitlesRequest);
    app.route('/v1/User-update-character-title').post(authMiddleware, app.src.main.controllers.AccountController.updateCharacterTitleInUseRequest);
    app.route('/v1/User-get-guildList').get(app.src.main.controllers.GuildsController.GetGuildListRequest);
    app.route('/v1/User-get-characterList').post(authMiddleware, app.src.main.controllers.AccountController.getCharacterListFromAccountRequest);
    app.route('/v1/User-get-guildInformations').post(app.src.main.controllers.GuildsController.GetGuildInformationsRequest);
    app.route('/v1/User-accept-guild-invitation').post(authMiddleware, app.src.main.controllers.GuildsController.GetGuildAcceptInvitationRequest);
    app.route('/v1/User-remove-player-from-guild').post(authMiddleware, app.src.main.controllers.GuildsController.GuildOnDeleteCharRequest);
    app.route('/v1/User-get-AllWorld-Players').post(authMiddleware, app.src.main.controllers.WorldsController.getAllPlayersFromWorldRequest);
    app.route('/v1/User-invite-newPlayer').post(authMiddleware, app.src.main.controllers.GuildsController.newGuildInviteRequest);
    app.route('/v1/User-guild-invite-cancel').post(authMiddleware, app.src.main.controllers.GuildsController.guildInviteCancelRequest);
    app.route('/v1/User-guild-update-member').post(authMiddleware, app.src.main.controllers.GuildsController.guildUpdateMemberRequest);
    app.route('/v1/User-guild-createNew-rank').post(authMiddleware, app.src.main.controllers.GuildsController.guildCreateNewRankRequest);
    app.route('/v1/User-guild-changeRank-name').post(authMiddleware, app.src.main.controllers.GuildsController.guildChangeRankNameRequest);
    app.route('/v1/User-guild-deleteRank').post(authMiddleware, app.src.main.controllers.GuildsController.guildDeleteRankRequest);
    app.route('/v1/User-get-accountInfo').post(authMiddleware, app.src.main.controllers.AccountController.getInfoFromAccountRequest);
    app.route('/v1/User-guild-createGuild').post(authMiddleware, app.src.main.controllers.GuildsController.createNewGuildRequest);
    app.route('/v1/User-players-quantity').get(app.src.main.controllers.AccountController.getPlayerQuantity);
    app.route('/v1/twitch/get-lives').get(app.src.main.modules.twitch.controllers.TwitchApiController.twitch);
    app.route('/v1/twitch/get-official-streamers').get(app.src.main.modules.twitch.controllers.TwitchApiController.getOfficialStreamersChannelInfo);

    /////////////////////////////////////////////////////////////////UNIFIED ROUTES///////////////////////////////////////////////////////////////
    app.route('/v1/unifiedRoute-donatePage-getProducts').get(app.src.main.controllers.UnifiedCallsController.getProductsToDonateCoinsTableUnifiedCallController);
    
    
       /////////////////////////////////////////////////// Admin Routes //////////////////////////////////////////////////////////
    app.route('/v1/admin-login').post(app.src.main.controllers.AdminController.LoginAdminAccRequest);
    app.route('/v1/validate-token-admin').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminValidateJsonTokenRequest);
    app.route('/v1/AdminGet-ticketList').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdmingetTicketListRequest);
    app.route('/v1/AdminGet-ticket').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetTicketRequest);
    app.route('/v1/Admin-ticket-update').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminTicketUpdateRequest);
    app.route('/v1/Admin-ticket-insert-new-response').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminTicketInsertNewResponseRequest);
    app.route('/v1/Admin-ticket-delete').post(AdminAuthMiddleware, app.src.main.controllers.TicketsController.AdminOnDeleteTicketRequest);
    app.route('/v1/Admin-get-client-version').get(AdminAuthMiddleware, app.src.main.controllers.ClientVersionController.GetClientVersionRequest);
    app.route('/v1/Admin-update-client-version').post(AdminAuthMiddleware, app.src.main.controllers.ClientVersionController.UpdateClientVersionRequest);
    app.route('/v1/Admin/insert-new-streamer').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminInsertNewStreamer);
    app.route('/v1/Admin/twitch/get-official-streamers').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetOfficialStreamersListController);
    app.route('/v1/Admin/twitch/update-streamers').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminUpdateOfficialStreamersController);
    app.route('/v1/Admin/twitch/remove-streamers').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminRemoveOfficialStreamerController);
    app.route('/v1/Admin/twitch/getCupom-byStreamer').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetCupomByStreamerController);
    app.route('/v1/Admin/twitch/get-all-cupoms').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetAllCupomsController);
    app.route('/v1/Admin/twitch/update-cupom').put(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminUpdateCupomController);
    app.route('/v1/Admin/twitch/cupom/:id').delete(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminDeleteCupomController);
    app.route('/v1/Admin/twitch/get-streamer-byId').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetOfficialStreamerController);
    app.route('/v1/Admin/twitch/insert-cupom').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminInsertNewCupomController);
    app.route('/v1/Admin/contracts').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetContractListController);
    app.route('/v1/Admin/contracts/:id').get(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminGetContractController);
    app.route('/v1/Admin/contracts/:id').put(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminUpdateContractController);
    app.route('/v1/Admin/contracts/:id').delete(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminDeleteContractController);
    app.route('/v1/Admin/contracts').post(AdminAuthMiddleware, app.src.main.controllers.AdminController.AdminInsertNewContractController);
    
//att
    //////Error MiddleWare/////
    app.use((err, req, res, next) => {
        if (err instanceof multer.MulterError || err.message === 'Invalid file type. Only JPEG and PNG files are allowed.') {
          return res.status(400).json({ error: err.message });
        }
      
        next(err);
      });
}