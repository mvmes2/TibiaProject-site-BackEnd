require('dotenv').config();
const fs = require('fs');
const util = require('util');
const { twitchApiaUTH, twitchApi } = require('../api/twitchApi');

module.exports = app => {
	const moment = require('moment');

	const twitchAuthController = async () => {
		console.log('id: ', process.env.TWITCH_CLIENT_ID);
		console.log('secret: ', process.env.TWITCH_CLIENT_SECRET);
		const body = {
			client_id: process.env.TWITCH_CLIENT_ID,
			client_secret: process.env.TWITCH_CLIENT_SECRET,
			grant_type: 'client_credentials'
		}
		try {
			const resp = await twitchApiaUTH.post('/oauth2/token', body);
			const token = resp?.data?.access_token;
			return token;
		} catch (err) {
			console.log('err aqui', err);
			throw new Error(err);
		}
	}

	return {
		twitchAuthController
	}
}