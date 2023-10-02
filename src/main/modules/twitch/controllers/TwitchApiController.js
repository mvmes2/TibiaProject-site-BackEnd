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

		// const livesStremandoTibiaProject = liveStreams.filter((item) => item.title.toLowerCase().includes('#tibiaproject'));
		const livesStremandoTibiaProject = liveStreams.filter((item) => item.user_name == 'EliasTibianoDoido');

		const checkStreamToUpdate = await getAllStreamersList();

		livesStremandoTibiaProject.map(async (item) => {

				item.thumbnail_url = item.thumbnail_url.replace('{width}', 170),
				item.thumbnail_url = item.thumbnail_url.replace('{height}', 120)

			const insertLiveToOficialStreamersLiveCheck = async (streamerid, streamer) => {

				const oficialStreamersList = await getAllOficialStreamersList();

				const checkIfAlreadyExistLiveCheck = await getAllOficialStreamersLiveCheckList();

				if (oficialStreamersList.some((streamerSome) => streamerSome.twitch_user_id == streamer.user_id) && !checkIfAlreadyExistLiveCheck.find((find) => find.live_id== streamer.id)) {
					const newOficialStreamerToCheck = {
						streamer_id: Number(streamerid),
						streamer_twitch_id: streamer.user_id,
						streamer_name: streamer.user_name,
						live_id: streamer.id,
						live_title: streamer.title,
						live_started_at: streamer.started_at
					};
					await inserStreamerAtLiveCheckTime(newOficialStreamerToCheck);
				}
			}

			if (checkStreamToUpdate.some((itemSome) => item.id == itemSome.stream_id)) {

				const getLive = await getStreamerLive({id: item.user_id});

				const getStreamerIDATDB = getLive[0].id;

				const streamerUpdate = {
					id: item.id,
					update: {
						stream_title: item.stream_title,
						viewer_count: item.viewer_count,
						thumbnail_url: item.thumbnail_url
					}
				}
				await insertLiveToOficialStreamersLiveCheck(getStreamerIDATDB, item);

				return await updateLiveStream(streamerUpdate);

			} else if (!checkStreamToUpdate.some((itemSome) => item.id == itemSome.id)) {
				
				const insert = {
					stream_id: item.id,
					user_name: item.user_name,
					user_login: item.user_login,
					user_id: item.user_id,
					game_name: item.game_name,
					stream_title: item.title,
					language: item.language,
					language: item.language,
					thumbnail_url: item.thumbnail_url,
					stream_started_at: item.started_at,
					viewer_count: item.viewer_count,
				}
				const streamerIDAtDB = await insertNewStreamer(insert);
				await insertLiveToOficialStreamersLiveCheck(streamerIDAtDB, item);				
			}
		});
		
		const livesStremandoTibiaProjectFromDB = await getAllStreamersList();
		twithLastUpdated = moment();
		twitchData = livesStremandoTibiaProjectFromDB;
		return res.status(200).send(livesStremandoTibiaProjectFromDB);
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