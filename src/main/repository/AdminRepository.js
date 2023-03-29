const { worlds, players, accounts } = require('../models/projectModels');
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

module.exports = {
	AdminLoginRepository
}