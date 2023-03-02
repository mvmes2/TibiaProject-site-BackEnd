module.exports = app => {
    const { checkValidLoginHash } = app.src.main.services.AccountService;
    const validateAccountRequest = async (req, res) => {
        const data = req.body;
        const resp = await checkValidLoginHash(data)
    res.status(resp.status).send({message: resp.message});
}
    return {
        validateAccountRequest,
    }
}