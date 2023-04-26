module.exports = app => {
	const { getGuildList, getGuildMembersList } = app.src.main.repository.GuildsRepository;

	const GetGuildListRequest = async (req, res) => {
		const resp = await getGuildList()
		res.status(resp.status).send({ message: resp.message });
	}

	const GetGuildMemberListRequest = async (req, res) => {
		const data = req.body;
		const resp = await getGuildMembersList(data)
		res.status(resp.status).send({ message: resp.message });
	}


	return {
		GetGuildListRequest,
		GetGuildMemberListRequest
	}
}