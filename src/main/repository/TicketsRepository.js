const { tickets, tickets_response, tickets_images } = require('../models/projectModels');

const getTicketListFromUser = async (data) => {
	try {
		const ticketList = await tickets.query().select('*').where({ account_id: data.id });
		return { status: 200, message: ticketList };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error' }
	}
}

const getLastIdFromTicketList = async (data) => {
	try {
		const ticketListLastId = await tickets.query().select('id').orderBy('id', 'desc').first();
		return { status: 200, message: ticketListLastId };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error' }
	}
}

const CreateNewTicketInDB = async (data, files) => {
	try {
		const newTicket = {
			type: data.reportType,
			author_name: data.account_name,
			account_id: Number(data.account_id),
			account_email: data.account_email,
			status: 'Pending Staff Response',
			content: JSON.stringify(data.textAreaData),
			language: data.language,
			createdAt: (Date.now() / 1000)
		}
		const ticket = await tickets.query().insert(newTicket);
		console.log('oque temos aqui? ', ticket)
		let ticketImage = null;
		if (files?.length > 0) {
			files.map(async (file) => {
				const newTicketImage = {
					ticket_id: (Number(ticket.id)),
					image_name: file.filename
				}
				ticketImage = await tickets_images.query().insert(newTicketImage);
			})
			console.log('kd imagens?  ', ticketImage)
		}

		return { status: 200, message: 'ok' };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error at creating ticket' }
	}
}

const getTicket = async (data) => {
	try {
		const ticket = await tickets.query().select('*').where({ id: data.id }).first();
		const ticketImages = await tickets_images.query().select('*').where({ ticket_id: data.id });
		const ticketReponses = await tickets_response.query().select('*').where({ ticket_id: data.id });

		const newTicketToRender = {
			...ticket,
			ticketImages,
			ticketReponses
		}
		return { status: 200, message: newTicketToRender };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error' }
	}
}

const updateTicketsRepository = async (data) => {
	try {
		await tickets.query().update(data.update).where({ id: data.id });
		return { status: 200, message: 'ticket updated!' }
	} catch (err) {
		console.log('Error while trying to update ticket at: updateTicketsRepository... ', err);
		return { status: 500, message: 'Internal error' }
	}
}

const insertNewTicketResponseRepository = async (data) => {
	try {
		await tickets_response.query().insert(data);
		return { status: 201, message: 'response inserted!' }
	} catch (err) {
		console.log('Error while trying to insert ticketResponse at: insertNewTicketResponseRepository... ', err);
		return { status: 500, message: 'Internal error' }
	}
}

module.exports = {
	getTicketListFromUser,
	CreateNewTicketInDB,
	getLastIdFromTicketList,
	getTicket,
	updateTicketsRepository,
	insertNewTicketResponseRepository
}