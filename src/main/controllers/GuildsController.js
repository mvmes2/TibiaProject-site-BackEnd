module.exports = app => {
	const { getGuildList } = app.src.main.repository.GuildsRepository;

	const GetGuildListRequest = async (req, res) => {
		const resp = await getGuildList()
		res.status(resp.status).send({ message: resp.message });
	}


	return {
		GetGuildListRequest,
	}
}