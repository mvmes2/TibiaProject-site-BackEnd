const axios = require('axios');

const twitchApiaUTH = axios.create({
    baseURL: process.env.TWITCH_API_AUTH,
});

const twitchApi = axios.create({
    baseURL: process.env.TWITCH_API,
});

module.exports = { twitchApiaUTH, twitchApi }