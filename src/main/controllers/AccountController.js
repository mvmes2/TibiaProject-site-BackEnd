module.exports = app => {
    const { checkValidLoginHash, createCharacterSerice } = app.src.main.services.AccountService;
    const validateAccountRequest = async (req, res) => {
        const data = req.body;
        const resp = await checkValidLoginHash(data)
    res.status(resp.status).send({message: resp.message});
}

const createCharacterRequest = async (req, res) => {
    const data = req.body;
    const resp = await createCharacterSerice(data)
res.status(resp.status).send({message: resp.message});
}
    return {
        createCharacterRequest,
        validateAccountRequest
    }
}