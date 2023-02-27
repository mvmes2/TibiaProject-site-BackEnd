module.exports = app => {
    const { CreateAccService } = app.src.main.services.CreateAccService;
    const CreateAccRequest = async (req, res) => {
        const data = req.body;
        const resp = await CreateAccService(data)
    res.status(resp.status).send({message: resp.message});
}
    return {
        CreateAccRequest,
    }
}