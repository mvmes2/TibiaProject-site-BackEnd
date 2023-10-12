const { twitchApiaUTH, twitchApi } = require('../api/twitchApi');

module.exports = app => {
	const moment = require('moment');
	const { twitchAuthController } = app.src.main.modules.twitch.controllers.AuthController;
	const { inserStreamerAtLiveCheckTime, getAllOficialStreamersList, getAllOficialStreamersLiveCheckList,
	} = app.src.main.modules.twitch.repository.twitchRepository;

	let cacheTwitchLastUpdated = 0;
	let cacheTwitchData = null;

	let cacheGetOfficialStreamersChannelInfoLastUpdated = 0
	let cacheGetOfficialStreamersChannelInfoData = null;

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
		if (moment().diff(cacheTwitchLastUpdated, 'minutes') < 2) {
			console.log('cache Twitch feito com sucesso!');
			return res.status(200).send(cacheTwitchData);
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

		cacheTwitchLastUpdated = moment();
		cacheTwitchData = livesStremandoTibiaProject;

		return res.status(200).send(livesStremandoTibiaProject);
	}

	const getOfficialStreamersChannelInfo = async (req, res) => {
		try {

			if (moment().diff(cacheGetOfficialStreamersChannelInfoLastUpdated, 'minutes') < 5) {
				console.log('cache getOfficialStreamersChannelInfo feito com sucesso!');
				return res.status(200).send(cacheGetOfficialStreamersChannelInfoData);
			}

			const getToken = await twitchAuthController();

			const headers = {
				Authorization: `Bearer ${getToken}`,
				'Client-Id': process.env.TWITCH_CLIENT_ID
			}

			const oficialStreamersList = await getAllOficialStreamersList();
			const officialList = await Promise.all(oficialStreamersList.map(async (item) => {
				if (item.streamer_status != 'inactive') {
					const streamers = await twitchApi.get(`/helix/users?id=${item.twitch_user_id}`, { headers });
					const getFallowersCount = await twitchApi.get(`/helix/channels/followers?broadcaster_id=${item.twitch_user_id}`, { headers });
					streamers.data.data[0].followers = getFallowersCount?.data?.total;
					return streamers?.data?.data[0];
				}
			}));

			const filteredOfficialList = officialList.filter((filter) => filter != null);

			cacheGetOfficialStreamersChannelInfoLastUpdated = moment();
			cacheGetOfficialStreamersChannelInfoData = filteredOfficialList;

			return res.status(200).send(filteredOfficialList);
		} catch (err) {
			console.log(err);
			return res.status(500).send({ message: 'Internal error!' });
		}
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
		getOfficialStreamersChannelInfo
		// getTwitchUserID
	}
}