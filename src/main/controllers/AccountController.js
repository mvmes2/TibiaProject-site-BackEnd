module.exports = app => {
    const { checkValidLoginHash, createCharacterSerice, validateCharacterService, deleteCharacterService, updateHidenCharacterService, updateCharacterCommentService } = app.src.main.services.AccountService;
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

const checkCharacterOwnershipRequest = async (req, res) => {
    const data = req.body;
    const resp = await validateCharacterService(data)
res.status(resp.status).send({message: resp.message});
}

const deleteCharacterRequest = async (req, res) => {
    const data = req.body;
    const resp = await deleteCharacterService(data)
    res.status(resp.status).send({message: resp.message});
}

const updateHidenCharacterRequest = async (req, res) => {
    const data = req.body;
    const resp = await updateHidenCharacterService(data)
    res.status(resp.status).send({message: resp.message});
}

const updateCharacterCommentRequest = async (req, res) => {
    const data = req.body;
    const resp = await updateCharacterCommentService(data)
    res.status(resp.status).send({message: resp.message});
}

    return {
        createCharacterRequest,
        validateAccountRequest,
        checkCharacterOwnershipRequest,
        deleteCharacterRequest,
        updateHidenCharacterRequest,
        updateCharacterCommentRequest
    }
}