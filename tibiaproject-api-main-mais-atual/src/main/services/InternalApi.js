const axios = require('axios');

const internalApi = axios.create({
    baseURL: process.env.INTERNAL_CHECK_CLIENT_VERSION_API_BASE_URL,
});

module.exports = { internalApi }