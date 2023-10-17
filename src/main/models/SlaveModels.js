const knexSlave = require('../../../knexfile-slave');
const knex = require('knex');
const connectionDBSlave = knex(knexSlave);

const streamers = () => {
    return connectionDBSlave('streamers');
}

const streamers_live_check_time = () => {
    return connectionDBSlave('streamers_live_check_time');
}

const cupoms = () => {
    return connectionDBSlave('cupoms');
}

const payments = () => {
    return connectionDBSlave('payments');
}

const products = () => {
    return connectionDBSlave('products');
}

const redeem_cupom_storage = () => {
    return connectionDBSlave('redeem_cupom_storage');
}

const tickets = () => {
    return connectionDBSlave('tickets');
}

const tickets_images = () => {
    return connectionDBSlave('tickets_images');
}

const tickets_response = () => {
    return connectionDBSlave('tickets_response');
}

const tickets_response_images = () => {
    return connectionDBSlave('tickets_response_images');
}

const payer_list = () => {
    return connectionDBSlave('payer_list');
}

const contracts = () => {
    return connectionDBSlave('contracts');
}

const contracts_payment_types = () => {
    return connectionDBSlave('contracts_payment_types');
}

module.exports = { streamers, streamers_live_check_time, cupoms, payments, redeem_cupom_storage, products, tickets, tickets_images,
    tickets_response, tickets_response_images, payer_list, contracts, contracts_payment_types };
