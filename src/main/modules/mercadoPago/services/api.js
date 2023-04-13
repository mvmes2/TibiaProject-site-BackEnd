const axios = require('axios');

const api = axios.create({
    baseURL: process.env.MERCADO_PAGO_API,
});

module.exports = { api }