module.exports = app => {
    app.route('/teste').get(app.src.main.controllers.ServerTestResponseController.TesteRequest);
    app.route('/create-acc').post(app.src.main.controllers.CreateAccController.CreateAccRequest);
}