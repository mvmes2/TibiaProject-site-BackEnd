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
    
}