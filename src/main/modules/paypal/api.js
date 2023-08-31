const axios = require('axios');

const api = axios.create({
    baseURL: process.env.PAG_SEGURO_BASE_URL_API,
});

module.exports = { api }