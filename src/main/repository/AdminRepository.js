const { worlds, players, accounts, tickets, tickets_images, tickets_response } = require('../models/projectModels');
const { generateTokenAdmin, checkPassword } = require('../utils/utilities');

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

		const adminToken = generateTokenAdmin(60, withoutPassword);

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

module.exports = {
	AdminLoginRepository,
	AdminGetTicketListRepository,
	getTicketRepository
}