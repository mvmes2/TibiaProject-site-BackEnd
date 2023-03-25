require('dotenv').config();
const fs = require('fs');
const util = require('util');

module.exports = app => {
	const { insertNewStripesPayment } = app.src.main.modules.stripes.repository.StripesRepository;

	const StripesinsertNewPaymentService = async (data) => {
		const resp = await insertNewStripesPayment(data);
		return { status: resp.status, message: resp.message };
	}

	return {
		StripesinsertNewPaymentService,
	}
}