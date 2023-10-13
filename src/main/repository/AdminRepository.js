const { worlds, players, accounts, tickets, tickets_images, tickets_response, tickets_response_images } = require('../models/MasterModels');
const { generateTokenAdmin, checkPassword } = require('../utils/utilities');
const { streamers, cupoms, redeem_cupom_storage } = require('../models/SlaveModels');

const AdminLoginRepository = async (data) => {
	console.log(data)
	try {
		const adminAccounts = await accounts.query()
			.select('email', 'name', 'type', 'web_flags', 'password')
			.where({ email: data.email })
			.andWhere('type', '>', 3)
			.andWhere({ web_flags: 3 });

		console.log('acc....: ', adminAccounts)

		if (adminAccounts?.length < 1) {
			return { status: 400, message: 'Conta não existe ou você não é um Admin! VAZA!' }
		}
		const adminAcc = adminAccounts[0];

		const isPasswordValid = checkPassword(data.password, adminAcc.password);
		console.log(isPasswordValid)
		if (!isPasswordValid) { return { status: 400, message: 'Senha errada!' } };

		const { password, ...withoutPassword } = adminAcc;

		const adminToken = generateTokenAdmin(1440, withoutPassword);

		return { status: 200, message: adminToken }

	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error, at adminLogin repository!' }
	}
}

const AdminGetTicketListRepository = async () => {
	try {
		const ticketList = await tickets.query().select('*');

		return { status: 200, message: ticketList }
	} catch (err) {
		console.log('erro ao tentar recuperar ticketList em AdminGetTicketsRepository: ', err)
		return { status: 500, message: 'Internal Error' }
	}

}

const getTicketRepository = async (data) => {
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

const insertNewStreamerToDB = async (data) => {
	try {
		if (!data) {
			return { status: 400, message: 'faltando informações para inserção do streamer!' }
		} else {
			await streamers().insert(data);
			return { status: 200, message: 'Streamer inserido com sucesso!' }
		}
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Error ao inserir novo streamer' }
	}
}

const GetAllOfficialStreamersListFromDB = async () => {

	try {
		const list = await streamers().select('*');
		return { status: 200, data: list }
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const GetOfficialStreamersByIDFromDB = async (streamerId) => {

	try {
		const streamer = await streamers().select('*').where({ id: streamerId });
		if (!streamer.length) {
			return { status: 400, message: 'Not found streamer'}
		}
		return { status: 200, data: streamer[0] }
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminUpdateOfficialStreamerDB = async (data) => {
	console.log('como ta vindo a data de update? ', data);
	try {
		await streamers().update(data.update).where({ id: Number(data.id) });
		return { status: 200, message: 'Streamer Updated Successfully' }
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminRemoveOfficialStreameFromDB = async (data) => {
	console.log('como ta vindo a data de delete Streamer?? ', data);
	try {
		await streamers().delete().where({ id: Number(data.id) });
		return { status: 204, message: 'Streamer has been deleted Successfully!' };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminGetCupomByStreamerFromDB = async (data) => {
	console.log('como ta vindo a data de AdminGetCupomByStreamerFromDB?? ', data);
	if (!data) {
		return { status: 400, message: "Data inválida, esperado { headers: { streamer_id: id } }" };
	}
	try {
		const cupomsByStreamer = await cupoms().select('*').where({ streamer_id: Number(data) });
		return { status: 200, data: cupomsByStreamer };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminGetAllCupomsFromDB = async () => {
	try {
		const getCupoms = await cupoms().select('*').where({ status: 'active' });
		return { status: 200, data: getCupoms };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminUpdateCupomAtDB = async (data) => {
	console.log('como ta vindo a data de AdminUpdateCupomAtDB?? ', data);
	if (!data || !data?.id || !data?.update) {
		return { status: 400, message: "Data inválida, esperado body{ id: id, update: { 'updateData' } }  " };
	}
	try {
		const cupoms = await cupoms().update(data.update).where({ id: data.id });
		return { status: 200, message: "Cupom updated successfully!" };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminDeleteCupomAtDB = async (data) => {
	console.log('como ta vindo a data de delete AdminDeleteCupomAtDB?? ', data);
	try {
		await cupoms().delete().where({ id: Number(data.id) });
		return { status: 200, message: 'Cupom has been deleted Successfully!' };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const AdminGetRedeemCupomStorageAtDB = async () => {
	try {
		const redeemList = await redeem_cupom_storage().select('*');
		return { status: 200, data: redeemList };
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

module.exports = {
	AdminLoginRepository,
	AdminGetTicketListRepository,
	getTicketRepository,
	insertNewStreamerToDB,
	GetAllOfficialStreamersListFromDB,
	AdminUpdateOfficialStreamerDB,
	AdminRemoveOfficialStreameFromDB,
	AdminGetCupomByStreamerFromDB,
	AdminGetAllCupomsFromDB,
	AdminUpdateCupomAtDB,
	AdminDeleteCupomAtDB,
	AdminGetRedeemCupomStorageAtDB,
	GetOfficialStreamersByIDFromDB
}