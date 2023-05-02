const { tickets, tickets_response, tickets_images, tickets_response_images } = require('../models/projectModels');
const fs = require('fs');
const path = require('path');

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

		const responseImagesArr = await Promise.all(
			ticketReponses.map(async (response) => {
				const images = await tickets_response_images.query().select('*').where({ response_id: Number(response.id) });
				console.log('tem images? ', images);
				return images;
			})
		);

		const responseImages = responseImagesArr.flat();

		const newTicketToRender = {
			...ticket,
			ticketImages,
			ticketReponses,
			responseImages
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
	getLastIdFromTicketList,
	getTicket,
	updateTicketsRepository,
	insertNewTicketResponseRepository,
	AdminOnDeleteTicketRepository
}