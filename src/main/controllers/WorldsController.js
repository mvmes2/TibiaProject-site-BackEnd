module.exports = app => {
    const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
    const GetWorldListRequest = async (req, res) => {
        const resp = await GetWorldsListService()
    res.status(resp.status).send({message: resp.message});
}

const getAllWorldsCharactersRequest = async (req, res) => {
    const resp = await getAllWorldsCharactersService()
res.status(resp.status).send({message: resp.message});
}
    return {
        GetWorldListRequest,
        getAllWorldsCharactersRequest
    }
}