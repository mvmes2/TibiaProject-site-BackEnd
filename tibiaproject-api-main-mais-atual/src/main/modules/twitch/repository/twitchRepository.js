const { streamers_live_check_time, streamers } = require('../../../models/SlaveModels');

const getAllOficialStreamersList = async () => {
	try {
		const list = await streamers().select('*');
		return list;
	} catch (err) {
		console.log(err);
	}
}

const getAllOficialStreamersLiveCheckList = async () => {
	try {
		const list = await streamers_live_check_time().select('*');
		return list;
	} catch (err) {
		console.log(err);
	}
}

const inserStreamerAtLiveCheckTime = async (data) => {
	try {
		await streamers_live_check_time().insert(data);
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	inserStreamerAtLiveCheckTime,
	getAllOficialStreamersList,
	getAllOficialStreamersLiveCheckList,
}

