module.exports = app => {
	const moment = require('moment');

	const { getGuildList, getGuildInformation, guildAcceptInvitation, characterToRemoveFromGuild,
		newGuildInvite, guildInviteCancel, guildUpdateMember, guildCreateNewRank,
		guildChangeRankName, guildDeleteRank, createNewGuild } = app.src.main.repository.GuildsRepository;

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
		const data = req.body;
		console.log('o que ta vindo na datamanina do controller? ', data)
		const resp = await guildAcceptInvitation(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const GuildOnDeleteCharRequest = async (req, res) => {
		const data = req.body;
		const resp = await characterToRemoveFromGuild(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const newGuildInviteRequest = async (req, res) => {
		const data = req.body;
		const resp = await newGuildInvite(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildInviteCancelRequest = async (req, res) => {
		const data = req.body;
		const resp = await guildInviteCancel(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildUpdateMemberRequest = async (req, res) => {
		const data = req.body;
		const resp = await guildUpdateMember(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildCreateNewRankRequest = async (req, res) => {
		const data = req.body;
		const resp = await guildCreateNewRank(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildChangeRankNameRequest = async (req, res) => {
		const data = req.body;
		const resp = await guildChangeRankName(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const guildDeleteRankRequest = async (req, res) => {
		const data = req.body;
		const resp = await guildDeleteRank(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const createNewGuildRequest = async (req, res) => {
		const data = req.body;
		const resp = await createNewGuild(data);
		GetGuildListLastUpdate = 0;
		res.status(resp.status).send({ message: resp.message });
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
		createNewGuildRequest
	}
}