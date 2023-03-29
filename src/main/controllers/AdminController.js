module.exports = app => {
    const { AdminLoginRepository } = app.src.main.repository.AdminRepository;

    const LoginAdminAccRequest = async (req, res) => {
        const data = req.body;
        const resp = await AdminLoginRepository(data)
    res.status(resp.status).send({message: resp.message});
}

const AdminValidateJsonTokenRequest = async (req, res) => {
    const data = req.body;
    console.log('recebi um AdminToken válido uma request de: ', data)
    console.log('prossiga...')
    return res.status(200).send({message: 'okla', user: req.user});
}
    return {
        LoginAdminAccRequest,
        AdminValidateJsonTokenRequest
    }
}