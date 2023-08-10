module.exports = app => {
	const moment = require('moment');

	const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
	const { getWorldWideTopFivePlayersRepository, getAllPlayersFromWorld } = app.src.main.repository.WorldsRepository;
	const GetWorldListRequest = async (req, res) => {
		const resp = await GetWorldsListService()
		res.status(resp.status).send({ message: resp.message });
	}

	const getAllWorldsCharactersRequest = async (req, res) => {
		const resp = await getAllWorldsCharactersService()
		res.status(resp.status).send({ message: resp.message });
	}

	let getWorldWideTopFivePlayersRequestLastUpdate = 0;
	let worldWideTopFivePlayers = 0;

	const getWorldWideTopFivePlayersRequest = async (req, res) => {
		if (moment().diff(getWorldWideTopFivePlayersRequestLastUpdate, 'minutes') < 5) {
			console.log('cache getWorldWideTopFivePlayers feito com sucesso!');
			return res.status(worldWideTopFivePlayers.status).send({ message: worldWideTopFivePlayers.message });
		}
		getWorldWideTopFivePlayersRequestLastUpdate = moment();
		worldWideTopFivePlayers = await getWorldWideTopFivePlayersRepository()
		return res.status(worldWideTopFivePlayers.status).send({ message: worldWideTopFivePlayers.message });
	}

	const getAllPlayersFromWorldRequest = async (req, res) => {
		const data = req.body;
		const resp = await getAllPlayersFromWorld(data)
		return res.status(resp.status).send({ message: resp.message });
	}

	return {
		GetWorldListRequest,
		getAllWorldsCharactersRequest,
		getWorldWideTopFivePlayersRequest,
		getAllPlayersFromWorldRequest
	}
}