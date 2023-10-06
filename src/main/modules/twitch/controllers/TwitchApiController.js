const { twitchApiaUTH, twitchApi } = require('../api/twitchApi');

module.exports = app => {
	const moment = require('moment');
	const { twitchAuthController } = app.src.main.modules.twitch.controllers.AuthController;
	const { insertNewStreamer, getAllStreamersList, updateLiveStream, inserStreamerAtLiveCheckTime,
		getAllOficialStreamersList, getAllOficialStreamersLiveCheckList, getStreamerLive } = app.src.main.modules.twitch.repository.twitchRepository;

	let twithLastUpdated = 0;
	let twitchData = null;

	const getGameID = async (headers) => {
		try {
			const game = 'Tibia';
			const resp = await twitchApi.get(`/helix/search/categories?query=${game}`, { headers });
			const gameID = resp?.data?.data?.find((item) => item.name.match('Tibia'));
			return gameID.id;
		} catch (err) {
			console.log(err);
		}
	}

	const getLiveStreams = async (headers, gameID) => {
		const streamsList = [];
		let cursor = null;

		const queryParams = {
			game_id: gameID,
			language: 'pt',
			type: 'live',
			first: 100,
		};

		try {
			while (true) {
				if (cursor) {
					queryParams.after = cursor;
				}

				const queryString = Object.keys(queryParams)
					.map(key => `${key}=${queryParams[key]}`)
					.join('&');

				const response = await twitchApi.get(`/helix/streams?${queryString}`, { headers });

				if (!response?.data?.pagination?.cursor) {
					break; // Saia do loop quando não houver mais cursor
				}

				cursor = response?.data?.pagination?.cursor;

				streamsList.push(...response?.data?.data);
			}
			streamsList.sort((a, b) => b.viewer_count - a.viewer_count);
			console.log('stremando Tibia agora: ', streamsList.length);
			return streamsList;
		} catch (err) {
			console.error(err.data);
		}
	}


	const twitch = async (req, res) => {

		if (moment().diff(twithLastUpdated, 'minutes') < 2) {
			console.log('temos data?', twitchData);
			console.log('cache Twitch feito com sucesso!');
			return res.status(200).send(twitchData);
		}

		const getToken = await twitchAuthController();

		const headers = {
			Authorization: `Bearer ${getToken}`,
			'Client-Id': process.env.TWITCH_CLIENT_ID
		}

		const gameID = await getGameID(headers);

		const liveStreams = await getLiveStreams(headers, gameID);

		const livesStremandoTibiaProject = liveStreams.filter((item) => item.title.toLowerCase().includes('#tibiaproject'));
		// const livesStremandoTibiaProject = liveStreams.filter((item) => item.user_name == 'tibiaprojectbr');

		livesStremandoTibiaProject.map(async (item) => {

			item.thumbnail_url = item.thumbnail_url.replace('{width}', 170),
				item.thumbnail_url = item.thumbnail_url.replace('{height}', 120)

			const oficialStreamersList = await getAllOficialStreamersList();

			const checkIfAlreadyExistLiveCheck = await getAllOficialStreamersLiveCheckList();

			if (oficialStreamersList.some((streamerSome) => streamerSome.twitch_user_id == item.user_id) && !checkIfAlreadyExistLiveCheck.find((find) => find.live_id == item.id)) {
				const newOficialStreamerToCheck = {
					streamer_twitch_id: item.user_id,
					streamer_name: item.user_name,
					live_id: item.id,
					live_title: item.title,
					live_started_at: item.started_at
				};
				await inserStreamerAtLiveCheckTime(newOficialStreamerToCheck);
			}

		});

		twithLastUpdated = moment();
		twitchData = livesStremandoTibiaProject;

		return res.status(200).send(livesStremandoTibiaProject);
	}

	// const getTwitchUserID = async (req, res) => {
	// 	const data = req.body;
	// 	try {
	// 		const resp = await twitchApi.get(`/helix/users?login=${data.user_login}`);
	// 		const userID = resp?.data?.id;
	// 		if (!userID || userID == undefined || userID == null) {
	// 			return res.status(400).send({ message: 'Login não existente na twitch, ou erro ao buscar id para este login!' });
	// 		} else {
	// 			return res.status(200).send({ user_id: userID });
	// 		}
	// 	} catch (err) {
	// 		console.log(err);
	// 		return res.status(500).send({ message: `Internal error!, ${err}` });
	// 	}
	// }

	return {
		twitch,
		// getTwitchUserID
	}
}