
module.exports = app => {
	const moment = require('moment');

	const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
	const { getWorldWideTopFivePlayersRepository, getAllPlayersFromWorld } = app.src.main.repository.WorldsRepository;

	const PayerList = [];
	const TimeToLivePayerInfoHours = 25;

	const AddPayerToList = (payerInfo) => {
		// Verifica a expiração de todos os payers
		for (let i = PayerList.length - 1; i >= 0; i--) {
			const payer = PayerList[i];
			const duration = moment.duration(moment().diff(moment(payer.payerLastUpdated)));

			if (duration.asHours() > TimeToLivePayerInfoHours) {
				RemovePayerFromList(payer.payerID);
			}
		};

		const newPayer = {
			payerID: payerInfo.id,
			payerLastUpdated: moment().toISOString(),
			payerData: payerInfo.payerData
		}
		const payerExists = PayerList.some(payer => payer.payerID == payerInfo.id);

		if (!payerExists) {
			PayerList.push(newPayer);
		}


		console.log('Essa é a lista atual de payers depois de ser adicionado: ', PayerList);
	}

	const GetPayerAtList = (payerID) => {
		console.log(' qual id chegando? ', payerID)
		const payer = PayerList.find((item) => item.payerID == payerID);
		return payer;
	}

	const RemovePayerFromList = (payerID) => {
		console.log('Essa é a lista atual de payers antes de ser removido: ', PayerList);
		const index = PayerList.findIndex((item) => item.payerID == payerID);
		if (index !== -1) {
			PayerList.splice(index, 1);
		}
		console.log('Essa é a lista atual de payers depois de ser removido: ', PayerList);
	}


	return {
		AddPayerToList,
		GetPayerAtList,
		RemovePayerFromList
	}
}