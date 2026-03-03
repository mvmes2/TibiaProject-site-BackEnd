module.exports = app => {
	const { getTicketListFromUser, CreateNewTicketInDB, getTicket,
		updateTicketsRepository, insertNewTicketResponseRepository, AdminOnDeleteTicketRepository } = app.src.main.repository.TicketsRepository;
	const { AdminTicketInsertNewResponseService } = app.src.main.services.TicketsService;

	const GetTicketListRequest = async (req, res) => {
		const data = req.body;
		const resp = await getTicketListFromUser(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const CreateNewTicket = async (req, res) => {
		const files = req.files;
		const data = req.body
		console.log("arquivos...: ", files)
		console.log("infos...: ", data)
		const resp = await CreateNewTicketInDB(data, files)
		res.status(resp.status).send({ message: resp.message });
	}

	const GetTicketRequest = async (req, res) => {
		const data = req.body
		console.log('undefined? ', data)
		const resp = await getTicket(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminTicketUpdateRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateTicketsRepository(data);
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminTicketInsertNewResponseRequest = async (req, res) => {
		const { email_info, ...rest } = req.body;

		const resp = await AdminTicketInsertNewResponseService(rest, email_info);
		res.status(resp.status).send({ message: resp.message });
	}

	const UserTicketUpdateRequest = async (req, res) => {
		const data = req.body;
		const resp = await updateTicketsRepository(data);
		res.status(resp.status).send({ message: resp.message });
	}

	const UserTicketInsertNewResponseRequest = async (req, res) => {
		const files = req.files;
		const data = req.body;
		console.log('o que ta vindo no data? ', data)
		const resp = await insertNewTicketResponseRepository(data, files);
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminOnDeleteTicketRequest = async (req, res) => {
		const data = req.body;
		const resp = await AdminOnDeleteTicketRepository(data);
		res.status(resp.status).send({ message: resp.message });
	}

	return {
		GetTicketListRequest,
		CreateNewTicket,
		GetTicketRequest,
		AdminTicketUpdateRequest,
		AdminTicketInsertNewResponseRequest,
		UserTicketUpdateRequest,
		UserTicketInsertNewResponseRequest,
		AdminOnDeleteTicketRequest
	}
}