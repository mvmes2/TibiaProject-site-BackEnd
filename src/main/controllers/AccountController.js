module.exports = app => {

	const moment = require('moment');

	const { checkValidLoginHash, createCharacterSerice, validateCharacterService, deleteCharacterService,
		updateHidenCharacterService, updateCharacterCommentService, recoveryAccountGenericService,
		updateAccountPasswordService } = app.src.main.services.AccountService;
	const { updateAcc, getlAllPlayersToHighscoreRepository, getCharacterTitlesRepo, updateCharacterTitleInUseRepo } = app.src.main.repository.UserRepository;
	const { getAccountInfoRepository, getCharacterListFromAccount, getInfoFromAccount, getPlayerQuantityRepository } = app.src.main.repository.AccountRepository;

	const validateAccountRequest = async (req, res) => {
		const data = req.body;
		const resp = await checkValidLoginHash(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const createCharacterRequest = async (req, res) => {
		const data = req.body;
		const resp = await createCharacterSerice(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const checkCharacterOwnershipRequest = async (req, res) => {
		const data = req.body;
		const resp = await validateCharacterService(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const deleteCharacterRequest = async (req, res) => {
		const data = req.body;
		const resp = await deleteCharacterService(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const updateHidenCharacterRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateHidenCharacterService(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const updateCharacterCommentRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateCharacterCommentService(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const updateRKRequest = async (req, res) => {
		data = req.body;
		const resp = await updateAcc(data);
		return res.status(resp.status).send({ message: resp.message });
	}
	const recoveryAccountGenericRequest = async (req, res) => {
		console.log('consolando recebimento de data no controller.', req.body)
		data = req.body;
		const resp = await recoveryAccountGenericService(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const getAccountInfoRequest = async (req, res) => {
		const data = req.body;
		const resp = await getAccountInfoRepository(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const validateJsonTokenRequest = async (req, res) => {
		const data = req.body;
		console.log('recebi com token válido uma request de: ', data)
		console.log('prossiga...')
		return res.status(200).send({ message: 'okla', user: req.user });
	}

	let getlAllPlayersToHighscoreLastUpdate = 0;
	let AllPlayersToHighscore = 0;

	const getlAllPlayersToHighscoreController = async (req, res) => {
		const data = req.body.queryparam;
		console.log('o que temos aqu??? i', data)
		if (data == 'experience' && moment().diff(getlAllPlayersToHighscoreLastUpdate, 'seconds') < 15) {
			console.log('cache getlAllPlayersToHighscore feito com sucesso!');
			return res.status(AllPlayersToHighscore.status).send({ message: AllPlayersToHighscore.message });
		}
		getlAllPlayersToHighscoreLastUpdate = moment();
		AllPlayersToHighscore = await getlAllPlayersToHighscoreRepository(data);
		return res.status(AllPlayersToHighscore.status).send({ message: AllPlayersToHighscore.message });
	}

	const updateAccountPasswordRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateAccountPasswordService(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const getCharacterTitlesRequest = async (req, res) => {
		const data = req.body;
		const resp = await getCharacterTitlesRepo(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const updateCharacterTitleInUseRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateCharacterTitleInUseRepo(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const getCharacterListFromAccountRequest = async (req, res) => {
		const data = req.body;
		const resp = await getCharacterListFromAccount(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const getInfoFromAccountRequest = async (req, res) => {
		const data = req.body;
		const resp = await getInfoFromAccount(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	let lastUpdatePlayerQuantity = 0;
	let playersQuantity = 0;

	const getPlayerQuantity = async (req, res) => {
		console.log('lastUpdate: ', lastUpdatePlayerQuantity)
		if (moment().diff(lastUpdatePlayerQuantity, 'minutes') < 5) {
			console.log('cache feito com sucesso!');
			return res.status(playersQuantity.status).send({ message: playersQuantity.message });
		}
		lastUpdatePlayerQuantity = moment();
		playersQuantity = await getPlayerQuantityRepository();
		console.log('request enviada para o banco!');
		return res.status(playersQuantity.status).send({ message: playersQuantity.message });
	}

	return {
		createCharacterRequest,
		validateAccountRequest,
		checkCharacterOwnershipRequest,
		deleteCharacterRequest,
		updateHidenCharacterRequest,
		updateCharacterCommentRequest,
		updateRKRequest,
		recoveryAccountGenericRequest,
		getAccountInfoRequest,
		validateJsonTokenRequest,
		getlAllPlayersToHighscoreController,
		updateAccountPasswordRequest,
		updateCharacterTitleInUseRequest,
		getCharacterTitlesRequest,
		getCharacterListFromAccountRequest,
		getInfoFromAccountRequest,
		getPlayerQuantity
	}
}