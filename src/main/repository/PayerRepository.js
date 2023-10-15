const { payer_list } = require("../models/SlaveModels");
const moment = require('moment-timezone');

let createCharacterController = 0;
let lastPaymentIDUpdated = 0;

const getPayerListFromDB = async () => {
    try {
        const list = await payer_list().select('*');
        return list
    } catch (err) {
        console.log(err);
    }
}

const getPayerByIDFromDB = async (data) => {
    try {
        const payer = await payer_list().select('*').where({ transactionID: data }).first();
        return payer
    } catch (err) {
        console.log(err);
    }
}

const getPayerByAccountIDFromDB = async (data) => {
    try {
        const payer = await payer_list().select('*').where({ account_id: data }).orderBy('createdAt', 'desc').first();
        return payer
    } catch (err) {
        console.log(err);
    }
}

const insertNewPayer = async (data) => {
    try {
        await payer_list().insert(data);
    } catch (err) {
        console.log(err);
    }
}


module.exports = {
    getPayerListFromDB,
    insertNewPayer,
    getPayerByIDFromDB,
    getPayerByAccountIDFromDB
}