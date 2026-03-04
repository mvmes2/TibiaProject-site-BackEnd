require('dotenv');
module.exports = app => {
	const moment = require('moment');
	const { tokenValidation } = require('../utils/utilities');

	const { getGuildList, getGuildInformation, guildAcceptInvitation, characterToRemoveFromGuild,
		newGuildInvite, guildInviteCancel, guildUpdateMember, guildCreateNewRank,
		guildChangeRankName, guildDeleteRank, createNewGuild, setGuildDescription, updateGuildLogoDB } = app.src.main.repository.GuildsRepository;

	let GetGuildListLastUpdate = 0;
	let guildList = 0;

	const GetGuildListRequest = async (req, res) => {

		if (GetGuildListLastUpdate != 0 && moment().diff(GetGuildListLastUpdate, 'minutes') < 5) {
			console.log('cache GuildList feito com sucesso!');
			return res.status(guildList.status).send({ message: guildList.message });
		}

		GetGuildListLastUpdate = moment();
		guildList = await getGuildList();
		return res.status(guildList.status).send({ message: guildList.message });
	}

	const GetGuildInformationsRequest = async (req, res) => {
		const data = req.body;
		const resp = await getGuildInformation(data)
		res.status(resp.status).send({ message: resp.message });
		// yes
	}

	const GetGuildAcceptInvitationRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Accept or cancel guild invites are bloked right now, check news or discord news!!' });
		}
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await guildAcceptInvitation(data, validatedAccountID);
		res.status(resp.status).send({ message: resp.message });
	}

	const GuildOnDeleteCharRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Remove player from guild is bloked right now, check news or discord news!!' });
		}

		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		const resp = await characterToRemoveFromGuild(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const newGuildInviteRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Request guild invite is bloked right now, check news or discord news!!' });
		}
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await newGuildInvite(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildInviteCancelRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Cancel guild invite is bloked right now, check news or discord news!!' });
		}
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await guildInviteCancel(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildUpdateMemberRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Update guild members are bloked right now, check news or discord news!!' });
		}

		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);
		const resp = await guildUpdateMember(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildCreateNewRankRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Create guild rank is bloked right now, check news or discord news!!' });
		}
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await guildCreateNewRank(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildChangeRankNameRequest = async (req, res) => {
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await guildChangeRankName(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildDeleteRankRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Delete guild rank is bloked right now, check news or discord news!!' });
		}
		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await guildDeleteRank(data, validatedAccountID)
		res.status(resp.status).send({ message: resp.message });
	}

	const createNewGuildRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Create guild is bloked right now, check news or discord news!!' });
		}

		const data = req.body;
		console.log('&&& 2.5', data);
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;

		console.log('o que vem de data do front? ', data);
		console.log(' o que tem no token? ', isValidToken);
		console.log('tem token? ', token);

		const resp = await createNewGuild(data, validatedAccountID);
		GetGuildListLastUpdate = 0;
		res.status(resp.status).send({ message: resp.message });
	}

	const setGuildDescriptionRequest = async (req, res) => {
		if (process.env.TESTSERVER_ON == 'true') {
			return res.status(401).send({ message: 'Change guild description is bloked right now, check news or discord news!!' });
		}

		const data = req.body;
		const token = req.headers.authorization;
		const isValidToken = tokenValidation(token)
		const validatedAccountID = isValidToken?.data?.id;
		const resp = await setGuildDescription(data, validatedAccountID);
		GetGuildListLastUpdate = 0;
		res.status(resp.status).send({ message: resp.message });
	}

	const guildLogoRequest = async (req, res) => {
		const files = req.files;
		const data = {
            file: files[0],
            ...req.body
        };
		const resp = await updateGuildLogoDB(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	return {
		GetGuildListRequest,
		GetGuildInformationsRequest,
		GetGuildAcceptInvitationRequest,
		GuildOnDeleteCharRequest,
		newGuildInviteRequest,
		guildInviteCancelRequest,
		guildUpdateMemberRequest,
		guildCreateNewRankRequest,
		guildChangeRankNameRequest,
		guildDeleteRankRequest,
		createNewGuildRequest,
		setGuildDescriptionRequest,
		guildLogoRequest,
	}
}