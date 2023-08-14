const { tickets, tickets_response, tickets_images, tickets_response_images } = require('../models/projectModels');
const moment = require('moment');
const fs = require('fs');
const path = require('path');

let getTicketListData = 0;
let getTickeListInfo = 0;
let getTickeListLastUpdated = 0;

const getTicketListFromUser = async (data) => {
	console.log('VAI ENTRAR NO CACHE DE GETTICKETS??? ', data.id, getTicketListData.id);
//cache
	if (getTickeListLastUpdated !== 0 && getTicketListData.id === data.id && moment().diff(getTickeListLastUpdated, 'minutes') < 5) {
		console.log('ENTROU NO CACHE DE GETTICKETLIST!!');
		console.log('CACHE em getTicketList feito com sucesso!');
		return { status: 200, message: getTickeListInfo };
	}

	try {
		getTicketListData = data;

		console.log('NÃO ENTROU NO CACHE DE GETTICKETLIST!!');
		getTickeListInfo = await tickets.query().select('*').where({ account_id: data.id });
		getTickeListLastUpdated = moment();
		return { status: 200, message: getTickeListInfo };
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
		getTickeListLastUpdated = 0;
		return { status: 200, message: 'ok' };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error at creating ticket' }
	}
}

let ticketLastUpdated = 0;
let ticketInfo = 0;
let ticketData = 0;

const getTicket = async (data) => {
	console.log(' o que ta vindo no data de getTicket? ', data);
	//cache
	if (data.id === ticketData.id && moment().diff(ticketLastUpdated, 'minutes') < 2) {
		console.log('CACHE em getTicket feito com sucesso!');
		return { status: 200, message: ticketInfo };
	}
	try {
		ticketData = data;

		const ticket = await tickets.query().select('*').where({ id: data.id }).first();
		const ticketImages = await tickets_images.query().select('*').where({ ticket_id: data.id });
		const ticketReponses = await tickets_response.query().select('*').where({ ticket_id: data.id });

		const responseImagesArr = await Promise.all(
			ticketReponses.map(async (response) => {
				const images = await tickets_response_images.query().select('*').where({ response_id: Number(response.id) });
				return images;
			})
		);

		const responseImages = responseImagesArr.flat();

		ticketInfo = {
			...ticket,
			ticketImages,
			ticketReponses,
			responseImages
		}
		ticketLastUpdated = moment();
		return { status: 200, message: ticketInfo };
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

const insertNewTicketResponseRepository = async (data, files) => {
	console.log('tem files? ', files)
	try {
		const ticketResponse = await tickets_response.query().insert(data);

		if (files?.length > 0) {
			files.map(async (file) => {
				const newTicketImage = {
					ticket_id: ticketResponse.ticket_id,
					response_id: (Number(ticketResponse.id)),
					image_name: file.filename
				}
				await tickets_response_images.query().insert(newTicketImage);
			});
		}
		return { status: 201, message: 'response inserted!' }
	} catch (err) {
		console.log('Error while trying to insert ticketResponse at: insertNewTicketResponseRepository... ', err);
		return { status: 500, message: 'Internal error' }
	}
}

const AdminOnDeleteTicketRepository = async (data) => {
	const folderPath = path.join(__dirname, '..', 'resources', 'tickets-images', 'compressed');

	const responseImgsToDelete = await tickets_response_images.query().select('*').where({ ticket_id: data.id });
	const ticketImgTodelete = await tickets_images.query().select('*').where({ ticket_id: data.id });

	///Deletando imagens de ticketResponseImages no hd da maquina
	if (responseImgsToDelete?.length > 0) {
		try {
			responseImgsToDelete.forEach((file) => {
				const fileCompletePath = path.join(folderPath, file.image_name);
				// Verificando se o arquivo existe antes de tentar removê-lo
				if (fs.existsSync(fileCompletePath)) {
					fs.unlink(fileCompletePath, (err) => {
						if (err) {
							console.error(`Erro ao remover o arquivo: ${err}`);
						} else {
							console.log(`Arquivo removido: ${fileCompletePath}`);
						}
					});
				} else {
					console.warn(`Arquivo não encontrado: ${fileCompletePath}`);
				}
			})
		} catch (err) {
			console.log('erro ao tentar deletar arquivos em AdminOnDeleteTicketRepository, ', err);
			return { status: 500, message: 'Internal error' }
		}
	}

	///Deletando imagens de ticketImages no hd da maquina
	if (ticketImgTodelete?.length > 0) {
		try {
			ticketImgTodelete.forEach((file) => {
				const fileCompletePath = path.join(folderPath, file.image_name);
				// Verificando se o arquivo existe antes de tentar removê-lo
				if (fs.existsSync(fileCompletePath)) {
					fs.unlink(fileCompletePath, (err) => {
						if (err) {
							console.error(`Erro ao remover o arquivo: ${err}`);
						} else {
							console.log(`Arquivo removido: ${fileCompletePath}`);
						}
					});
				} else {
					console.warn(`Arquivo não encontrado: ${fileCompletePath}`);
				}
			})
		} catch (err) {
			console.log('erro ao tentar deletar arquivos em AdminOnDeleteTicketRepository, ', err);
			return { status: 500, message: 'Internal error' }
		}
	}

	///// deletando TicketResponsesImages
	await tickets_response_images.query().delete().where({ ticket_id: data.id });
	///// deletando TicketImages
	await tickets_images.query().delete().where({ ticket_id: data.id });
	///// deletando TicketResponses
	await tickets_response.query().delete().where({ ticket_id: data.id });
	///// deletando Ticket
	await tickets.query().delete().where({ id: data.id });
	return { status: 200, message: 'Deletado!' }
}

module.exports = {
	getTicketListFromUser,
	CreateNewTicketInDB,
	getTicket,
	updateTicketsRepository,
	insertNewTicketResponseRepository,
	AdminOnDeleteTicketRepository
}