

	const moment = require('moment');

	const PayerList = [];
	const TimeToLivePayerInfoHours = 25;

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
		// Verifica a expiração de todos os payers
		for (let i = PayerList.length - 1; i >= 0; i--) {
			const payer = PayerList[i];
			const duration = moment.duration(moment().diff(moment(payer.payerLastUpdated)));

			if (duration.asHours() > TimeToLivePayerInfoHours) {
				RemovePayerFromList(payer.transactionID);
			}
		};

		const newPayer = {
			transactionID: payerInfo.id,
			payerLastUpdated: moment().toISOString(),
			payerData: payerInfo.payerData
		}
		const payerExists = PayerList.some(payer => payer.transactionID == payerInfo.id);

		if (!payerExists) {
			PayerList.push(newPayer);
		}
		console.log('Essa é a lista atual de payers depois de ser adicionado: ', PayerList);
		return true;
	}



/**
 * Get the Payer Object at PayersList.
 * @param {string} transactionID - Usually the transactionID from the payer payment.
 * @returns - The payer object from the list.
 */
	module.exports.GetPayerAtList = async (transactionID) => {
		console.log(' qual id chegando no getPayer? ', transactionID)
		const payer = PayerList.find((item) => item.transactionID == transactionID);
		return payer;
	}

	
/**
 * Remove payer from PayersList.
 * @param {string} transactionID - Usually the transactionID from the payer payment.
 * @returns - {Promise<boolean>}.
 */
	module.exports.RemovePayerFromList = async (transactionID) => {
		console.log('Essa é a lista atual de payers antes de ser removido: ', PayerList);
		const index = PayerList.findIndex((item) => item.transactionID == transactionID);
		if (index !== -1) {
			PayerList.splice(index, 1);
		}
		console.log('Essa é a lista atual de payers depois de ser removido: ', PayerList);
		return true;
	}
