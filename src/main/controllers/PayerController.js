	const moment = require('moment');

	const { getPayerListFromDB, insertNewPayer, getPayerByIDFromDB } = require("../repository/PayerRepository");

	const TimeToLivePayerInfoHours = 24;

	const Payer = require("./PayerController");

/**
 * Add a payer to the list after checking for expired payers.
 * 
 * @function
 * @param {Object} payerInfo - The payer information.
 * @param {string} payerInfo.id - Usually the transactionID from the payer payment.
 * @param {*} payerInfo.payerData - All data from payer.
 * @property {string} payerInfo.id - Usually the transactionID from the payer payment.
 * @property {*} payerInfo.payerData - Usually all the payer data.
 * @returns {Promise<boolean>}
 */
	module.exports.AddPayerToList = async (payerInfo) => {
		const PayerList = await getPayerListFromDB();
		console.log(PayerList)
		// Verifica a expiração de todos os payers
		for (let i = PayerList.length - 1; i >= 0; i--) {
			const payer = PayerList[i];
			const duration = moment.duration(moment().diff(moment(payer.payerLastUpdated)));

			if (duration.asHours() > TimeToLivePayerInfoHours) {
				Payer.RemovePayerFromList(payer.transactionID);
			}
		};

		const newPayer = {
			transactionID: payerInfo.id,
			payerLastUpdated: moment().toISOString(),
			account_id: payerInfo.payerData.account_id,
			payerData: JSON.stringify(payerInfo.payerData),
			buy_time_limit_lock: moment().toISOString(),
			createdAt: (Date.now() / 100)
		}
		const payerExists = PayerList.some(payer => payer.transactionID == payerInfo.id);

		if (!payerExists) {
			await insertNewPayer(newPayer);
		}
		console.log('Essa é a lista atual de payers depois de ser adicionado: ', await getPayerListFromDB());
		return true;
	}



/**
 * Get the Payer Object at PayersList.
 * @param {string} transactionID - Usually the transactionID from the payer payment.
 * @returns - The payer object from the list.
 */
	module.exports.GetPayerAtList = async (transactionID) => {
		const singlePayer = await getPayerByIDFromDB(transactionID);
		console.log('o que e como vem aqui info do payer? ', singlePayer)
		singlePayer.payerData = JSON.parse(singlePayer.payerData);
		return singlePayer;
	}

	
/**
 * Remove payer from PayersList.
 * @param {string} transactionID - Usually the transactionID from the payer payment.
 * @returns - {Promise<boolean>}.
 */
	module.exports.RemovePayerFromList = async (transactionID) => {
		const PayerList = await getPayerListFromDB();
		const index = PayerList.findIndex((item) => item.transactionID == transactionID);
		if (index !== -1) {
			PayerList.splice(index, 1);
		}
		console.log('Essa é a lista atual de payers depois de ser removido: ', PayerList);
		return true;
	}
