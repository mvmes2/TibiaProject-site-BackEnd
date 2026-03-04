module.exports = app => {

	const moment = require('moment');

	const { checkValidLoginHash, createCharacterSerice, validateCharacterService, deleteCharacterService,
		updateHidenCharacterService, updateCharacterCommentService, recoveryAccountGenericService,
		updateAccountPasswordService } = app.src.main.services.AccountService;
	const { updateAcc, getlAllPlayersToHighscoreRepository, getCharacterTitlesRepo, updateCharacterTitleInUseRepo } = app.src.main.repository.UserRepository;
	const { getAccountInfoRepository, getCharacterListFromAccount, getInfoFromAccount, getPlayerQuantityRepository } = app.src.main.repository.AccountRepository;
	const { decryptData, tokenValidation } = require('../utils/utilities');

	const validateAccountRequest = async (req, res) => {
		const token = req.headers.authorization;
		const data = req.body;

		console.log('o que vem de data do front data?? ', data);
		if (!token || token === 'null') {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}

		const isValidToken = tokenValidation(token)
		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)

		if (!isValidToken || isValidToken?.data?.id !== data?.id) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}

		const resp = await checkValidLoginHash(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const createCharacterRequest = async (req, res) => {
		const token = req.headers.authorization;
		console.log(req.headers)
		const isValidToken = tokenValidation(token)
		const data = req.body;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)

		if (isValidToken?.data?.id !== data?.account_id) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}
		const resp = await createCharacterSerice(data, isValidToken)
		res.status(resp.status).send({ message: resp.message });
	}

	const checkCharacterOwnershipRequest = async (req, res) => {
		const data = req.body;
		const resp = await validateCharacterService(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const deleteCharacterRequest = async (req, res) => {
		const data = req.body;

		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		const resp = await deleteCharacterService(data, validatedAccountID);
		return res.status(resp.status).send({ message: resp.message });
	}

	let hiddenLastUpdated = 0;
	let hiddenCharNameInfo = 0;

	const updateHidenCharacterRequest = async (req, res) => {
		const data = req.body;

		if (hiddenCharNameInfo == data.name && moment().diff(hiddenLastUpdated, 'minutes') < 3) {
			console.log('cache feito com sucesso em deleteCharacterRequest!');
			return res.status(400).send({ message: 'You have to wait 3 minuts to update this character hide option again!' });
		}
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)


		const resp = await updateHidenCharacterService(data, validatedAccountID)
		hiddenLastUpdated = moment();
		hiddenCharNameInfo = data.name;
		return res.status(resp.status).send({ message: resp.message });
	}

	const updateCharacterCommentRequest = async (req, res) => {
		const data = req.body;

		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)
		const resp = await updateCharacterCommentService(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const updateRKRequest = async (req, res) => {
		try {
			const data = req.body;
			const resp = await updateAcc(data);
			return res.status(resp.status).send({ message: resp.message });
		} catch (err) {
			console.log(err)
			return res.status(500).send({ message: 'Internal error!' });
		}
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


	const getlAllPlayersToHighscoreController = async (req, res) => {
		const data = req.body.queryparam;
		const resp = await getlAllPlayersToHighscoreRepository(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const updateAccountPasswordRequest = async (req, res) => {
		console.log('como ta vindo esse badybody? ', req.body)
		const data = req.body;
		console.log('o que vem de data do front? ', data);
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)

		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)

		if (data.id !== isValidToken.data.id) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}

		const resp = await updateAccountPasswordService(data, isValidToken.data.id);
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
		const tokenUserData = req.user?.data || {};
		const data = {
			...req.body,
			id: req.body?.id || tokenUserData?.id,
			email: req.body?.email || tokenUserData?.email
		};

		if (!data?.email) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}

		if (Number(data?.id) !== Number(tokenUserData?.id)) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}

		const resp = await getCharacterListFromAccount(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const getInfoFromAccountRequest = async (req, res) => {
		console.log('como ta vindo esse badybody? ', req.body)
		const data = req.body;
		console.log('o que vem de data do front? ', data);
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)

		console.log(' o que tem no token? ', isValidToken)
		console.log('tem token? ', token)

		if (data.id !== isValidToken.data.id) {
			return res.status(401).send({ message: 'You dont have permission to access this account!' });
		}
		
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