module.exports = app => {
    const { GetWorldsListService } = app.src.main.services.WorldsService;
    const GetWorldListRequest = async (req, res) => {
        const resp = await GetWorldsListService()
    res.status(resp.status).send({message: resp.message});
}
    return {
        GetWorldListRequest,
    }
}