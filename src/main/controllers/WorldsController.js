module.exports = app => {
	const moment = require('moment');

	const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
	const { getWorldWideTopFivePlayersRepository, getAllPlayersFromWorld } = app.src.main.repository.WorldsRepository;

	let getWorldListRequestLastUpdate = 0;
	let WorldList = 0;

	const getWorldListRequest = async (req, res) => {

		if (moment().diff(getWorldListRequestLastUpdate, 'minutes') < 5) {
			console.log('cache WorldList feito com sucesso!');
			return res.status(WorldList.status).send({ message: WorldList.message });
		}

		getWorldListRequestLastUpdate = moment();
		WorldList = await GetWorldsListService();
		return res.status(WorldList.status).send({ message: WorldList.message });
	}

	let getAllWorldsCharactersLastUpdate = 0;
	let AllWorldsCharacters = 0;

	const getAllWorldsCharactersRequest = async (req, res) => {

		if (moment().diff(getAllWorldsCharactersLastUpdate, 'minutes') < 5) {
			console.log('cache AllWorldsCharacters feito com sucesso!');
			return res.status(AllWorldsCharacters.status).send({ message: AllWorldsCharacters.message });
		}

		getAllWorldsCharactersLastUpdate = moment();
		AllWorldsCharacters = await getAllWorldsCharactersService()

		return res.status(AllWorldsCharacters.status).send({ message: AllWorldsCharacters.message });
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
		getWorldListRequest,
		getAllWorldsCharactersRequest,
		getWorldWideTopFivePlayersRequest,
		getAllPlayersFromWorldRequest
	}
}