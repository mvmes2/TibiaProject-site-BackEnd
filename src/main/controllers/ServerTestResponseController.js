module.exports = app => {
    const { TesteService } = app.src.main.services.ServerTestService;
    const TesteRequest = async (req, res) => {
    const resp = await TesteService()
    res.status(resp.status).send({data: resp.data});
}
    return {
        TesteRequest,
    }
}