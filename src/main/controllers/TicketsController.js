module.exports = app => {
	const { getTicketListFromUser, CreateNewTicketInDB, getLastIdFromTicketList, getTicket, 
		updateTicketsRepository, insertNewTicketResponseRepository } = app.src.main.repository.TicketsRepository;

	const GetTicketListRequest = async (req, res) => {
		const data = req.body;
		const resp = await getTicketListFromUser(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const CreateNewTicket = async (req, res) => {
		const files = req.files;
		const data = req.body
		console.log("arquivos...: ", files )
		console.log("infos...: ", data )
		const resp = await CreateNewTicketInDB(data, files)
		res.status(resp.status).send({ message: resp.message });
	}

	const GetTicketListLastIdRequest = async (req, res) => {
		const resp = await getLastIdFromTicketList()
		res.status(resp.status).send({ message: resp.message });
	}

	const GetTicketRequest = async (req, res) => {
		const data = req.body
		console.log('undefined? ', data)
		const resp = await getTicket(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const TicketUpdateRequest = async (req, res) =>{
		const data = req.body;
		const resp = await updateTicketsRepository(data);
		res.status(resp.status).send({ message: resp.message });
	}

	const TicketInsertNewResponseRequest = async (req, res) =>{
		const data = req.body;
		const resp = await insertNewTicketResponseRepository(data);
		res.status(resp.status).send({ message: resp.message });
	}

	return {
		GetTicketListRequest,
		CreateNewTicket,
		GetTicketListLastIdRequest,
		GetTicketRequest,
		TicketUpdateRequest,
		TicketInsertNewResponseRequest
	}
}