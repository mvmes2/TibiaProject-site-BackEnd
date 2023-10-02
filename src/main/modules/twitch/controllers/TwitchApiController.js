const { twitchApiaUTH, twitchApi } = require('../api/twitchApi');

module.exports = app => {
	const moment = require('moment');
	const { twitchAuthController } = app.src.main.modules.twitch.controllers.AuthController;
	const { insertNewStreamer, getAllStreamersList, updateStreamer } = app.src.main.modules.twitch.repository.twitchRepository;

	const getGameID = async (headers) => {
		try {
			const game = 'Tibia';
			const resp = await twitchApi.get(`/helix/search/categories?query=${game}`, { headers });
			const gameID = resp?.data?.data?.find((item) => item.name.match('Tibia'));
			return gameID.id;
		} catch (err) {
			console.log(err);
			res.status(500).send({ message: 'Internal error!' });
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
			return streamsList;
		} catch (err) {
			console.error(err.data);
		}
	}


	const twitch = async (req, res) => {
		const getToken = await twitchAuthController();

		const headers = {
			Authorization: `Bearer ${getToken}`,
			'Client-Id': process.env.TWITCH_CLIENT_ID
		}

		const gameID = await getGameID(headers);

		const liveStreams = await getLiveStreams(headers, gameID);
		
		// const livesStremandoTibiaProject = liveStreams.filter((item) => item.title.toLowerCase().includes('#tibiaproject'));
		const livesStremandoTibiaProject = liveStreams.filter((item) => item.user_name == 'GuerreiroTetra');
		const checkStreamToUpdate = await getAllStreamersList();
		livesStremandoTibiaProject.map(async (item) => {
			console.log('some? ', checkStreamToUpdate)
			if (checkStreamToUpdate.some((itemSome) => item.id == itemSome.stream_id)) {
				const streamerUpdate = {
					id: item.id,
					update: {
						stream_title: item.stream_title,
						viewer_count: item.viewer_count,
					}
				}

				return await updateStreamer(streamerUpdate);
			} else if(!checkStreamToUpdate.some((itemSome) => item.id == itemSome.id)) {
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

				await insertNewStreamer(insert);
			}
		})
		console.log(livesStremandoTibiaProject)
		return res.status(200).send(headers);
	}

	return {
		twitch
	}
}