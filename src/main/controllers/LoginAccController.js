module.exports = app => {
    const { LoginAccService } = app.src.main.services.LoginAccService;
    const LoginAccRequest = async (req, res) => {
        const data = req.body;
        const resp = await LoginAccService(data)
    res.status(resp.status).send({message: resp.message});
}
    return {
        LoginAccRequest,
    }
}