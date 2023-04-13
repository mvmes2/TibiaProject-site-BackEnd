module.exports = app => {
	const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
	const { getWorldWideTopFivePlayersRepository } = app.src.main.repository.WorldsRepository;
	const GetWorldListRequest = async (req, res) => {
		const resp = await GetWorldsListService()
		res.status(resp.status).send({ message: resp.message });
	}

	const getAllWorldsCharactersRequest = async (req, res) => {
		const resp = await getAllWorldsCharactersService()
		res.status(resp.status).send({ message: resp.message });
	}

	const getWorldWideTopFivePlayersRequest = async (req, res) => {
		const resp = await getWorldWideTopFivePlayersRepository()
		res.status(resp.status).send({ message: resp.message });
	}

	return {
		GetWorldListRequest,
		getAllWorldsCharactersRequest,
		getWorldWideTopFivePlayersRequest
	}
}