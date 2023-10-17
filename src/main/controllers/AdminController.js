require('dotenv');
const { twitchAuthController } = require("../utils/utilities");
module.exports = app => {
	const { AdminLoginRepository, AdminGetTicketListRepository, getTicketRepository, insertNewStreamerToDB,
		GetAllOfficialStreamersListFromDB, AdminUpdateOfficialStreamerDB, AdminRemoveOfficialStreameFromDB,
		AdminGetCupomByStreamerFromDB, AdminGetAllCupomsFromDB, AdminUpdateCupomAtDB, AdminDeleteCupomAtDB,
		GetOfficialStreamersByIDFromDB, AdminInsertNewCupomAtDB } = app.src.main.repository.AdminRepository;
	const { twitchApi } = require('../modules/twitch/api/twitchApi');

	const LoginAdminAccRequest = async (req, res) => {
		const data = req.body;
		const resp = await AdminLoginRepository(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminValidateJsonTokenRequest = async (req, res) => {
		const data = req.body;
		console.log('recebi um AdminToken válido uma request de: ', data)
		console.log('prossiga...')
		return res.status(200).send({ message: 'okla', user: req.user });
	}

	const AdmingetTicketListRequest = async (req, res) => {
		const resp = await AdminGetTicketListRepository();
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminGetTicketRequest = async (req, res) => {
		const data = req.body
		const resp = await getTicketRepository(data)
		res.status(resp.status).send({ message: resp.message });
	}

	const AdminInsertNewStreamer = async (req, res) => {
		try {
			const Reqdata = req.body;
			const { streamer, ...data } = Reqdata

			if (!streamer) {
				await insertNewStreamerToDB(data);
				return res.status(200).send({ message: 'Colaborador criado com sucesso!' });
			}
			console.log(data)
			if (!data || !data?.twitch_user_name || data?.twitch_user_name == undefined || data?.twitch_user_name == null) {
				return res.status(400).send({ message: 'faltando twitch_user_name ou demais informações para inserção do streamer!' });
			}
			const twitchAccessToken = await twitchAuthController();
			const headers = {
				Authorization: `Bearer ${twitchAccessToken}`,
				'Client-Id': process.env.TWITCH_CLIENT_ID
			}

			const getUserId = await twitchApi.get(`/helix/users?login=${data.twitch_user_name}`, { headers });

			const userID = getUserId?.data?.data[0]?.id;

			if (!userID || userID == undefined || userID == null) {
				return res.status(400).send({ message: 'Login não existente na twitch, ou erro na api da twitch ao buscar id para este login! confirme o user_name!' });
			} if (!data.twitch_user_name || !data?.streamer_name || !data?.email) {
				return res.status(400).send({ message: 'Campos obrigatórios: twitch_user_name, streamer_name, email' });
			}
			else {
				const dataWithUserID = {
					...data,
					twitch_user_id: userID,
					twitch_user_login: getUserId?.data?.data[0]?.login,
				}
				const resp = await insertNewStreamerToDB(dataWithUserID);
				return res.status(resp.status).send(resp.message);
			}
		} catch (err) {
			console.log(err);
			return res.status(500).send({ message: 'Internal error!' });
		}
	}

	const AdminGetOfficialStreamersListController = async (req, res) => {

		try {
			const resp = await GetAllOfficialStreamersListFromDB();
			return res.status(resp.status).send(resp?.data ? resp.data : resp.message);
		} catch (err) {
			console.log(err);
			return res.status(500).send({ message: 'internal error!' });
		}
	}

	const AdminUpdateOfficialStreamersController = async (req, res) => {
		const data = req.body;
		const { id, update } = data
		const { streamer, ...dataUpdate } = update
		if (!streamer) {
			await AdminUpdateOfficialStreamerDB({id, update: dataUpdate});
			return res.status(200).send({ message: 'Colaborador criado com sucesso!' });
		}

		if (!dataUpdate || !dataUpdate?.twitch_user_name || dataUpdate?.twitch_user_name == undefined || dataUpdate?.twitch_user_name == null) {
			return res.status(400).send({ message: 'faltando twitch_user_name ou demais informações para inserção do streamer!' });
		}
		const twitchAccessToken = await twitchAuthController();
		const headers = {
			Authorization: `Bearer ${twitchAccessToken}`,
			'Client-Id': process.env.TWITCH_CLIENT_ID
		}

		const getUserId = await twitchApi.get(`/helix/users?login=${dataUpdate.twitch_user_name}`, { headers });

		const userID = getUserId?.data?.data[0]?.id;

		if (!userID || userID == undefined || userID == null) {
			return res.status(400).send({ message: 'Login não existente na twitch, ou erro na api da twitch ao buscar id para este login! confirme o user_name!' });
		} if (!dataUpdate.twitch_user_name || !dataUpdate?.streamer_name || !dataUpdate?.email) {
			return res.status(400).send({ message: 'Campos obrigatórios: twitch_user_name, streamer_name, email' });
		}
		else {
			const dataWithUserID = {
				id,
				update: {
					...dataUpdate,
					twitch_user_id: userID,
					twitch_user_login: getUserId?.data?.data[0]?.login,
				}
			}
			const resp = await AdminUpdateOfficialStreamerDB(dataWithUserID);
			return res.status(resp.status).send({ message: resp.message });		}

	}

	const AdminRemoveOfficialStreamerController = async (req, res) => {
		const data = req.body;
		const resp = await AdminRemoveOfficialStreameFromDB(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	const AdminGetCupomByStreamerController = async (req, res) => {
		const data = req?.headers?.streamer_id;
		const resp = await AdminGetCupomByStreamerFromDB(data);
		return res.status(resp.status).send(resp.data);
	}

	const AdminGetAllCupomsController = async (req, res) => {
		const resp = await AdminGetAllCupomsFromDB();
		return res.status(resp.status).send(resp.data);
	}

	const AdminUpdateCupomController = async (req, res) => {
		const data = req.body;
		const resp = await AdminUpdateCupomAtDB(data);
		return res.status(resp.status).send(resp.message);
	}

	const AdminInsertNewCupomController = async (req, res) => {
		const data = req.body;
		const resp = await AdminInsertNewCupomAtDB(data);
		return res.status(resp.status).send(resp.message);
	}

	const AdminDeleteCupomController = async (req, res) => {
		const data = req.body;
		const resp = await AdminDeleteCupomAtDB(data);
		return res.status(resp.status).send(resp.message);
	}

	const AdminGetOfficialStreamerController = async (req, res) => {
		const data = req?.headers?.streamerid;
		console.log(' o que esta vindo de AdminGetOfficialStreamerController???', data);
		const resp = await GetOfficialStreamersByIDFromDB(data);
		return res.status(resp.status).send(resp.data);
	}

	return {
		LoginAdminAccRequest,
		AdminValidateJsonTokenRequest,
		AdmingetTicketListRequest,
		AdminGetTicketRequest,
		AdminInsertNewStreamer,
		AdminGetOfficialStreamersListController,
		AdminUpdateOfficialStreamersController,
		AdminRemoveOfficialStreamerController,
		AdminGetCupomByStreamerController,
		AdminGetAllCupomsController,
		AdminUpdateCupomController,
		AdminDeleteCupomController,
		AdminGetOfficialStreamerController,
		AdminInsertNewCupomController
	}
}