require('dotenv');

module.exports = app => {
	const { AdminLoginRepository, AdminGetTicketListRepository, getTicketRepository, insertNewStreamerToDB,
		GetAllOfficialStreamersListFromDB, AdminUpdateOfficialStreamerDB } = app.src.main.repository.AdminRepository;
	const { twitchApi } = require('../modules/twitch/api/twitchApi');
	const { twitchAuthController } = app.src.main.modules.twitch.controllers.AuthController;

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
			const data = Reqdata.insert;

			if (!data?.streamer) {
				await insertNewStreamerToDB(data);
				return res.status(200).send({ message: 'Colaborador criado com sucesso!' });
			}

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
		const resp = await AdminUpdateOfficialStreamerDB(data);
		return res.status(resp.status).send({ message: resp.message });
	}

	return {
		LoginAdminAccRequest,
		AdminValidateJsonTokenRequest,
		AdmingetTicketListRequest,
		AdminGetTicketRequest,
		AdminInsertNewStreamer,
		AdminGetOfficialStreamersListController,
		AdminUpdateOfficialStreamersController
	}
}