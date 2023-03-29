module.exports = app => {
    const { AdminLoginRepository } = app.src.main.repository.AdminRepository;

    const LoginAdminAccRequest = async (req, res) => {
        const data = req.body;
        const resp = await AdminLoginRepository(data)
    res.status(resp.status).send({message: resp.message});
}
    return {
        LoginAdminAccRequest,
    }
}