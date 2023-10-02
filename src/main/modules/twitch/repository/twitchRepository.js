const { livestreams, streamers_live_check_time, streamers } = require('../../../models/SlaveModels');

const insertNewStreamer = async (data) => {
	try {
		const id = await livestreams().insert(data);

		return { status: 201, message: 'Created new streamer', id: id[0]}
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const getAllStreamersList = async () => {
	try {
		const list = await livestreams().select('*');
		return list;
	} catch (err) {
		console.log(err);
	}
}

const getStreamerLive = async (data) => {

	try {
		const live = await livestreams().select('*').where({ user_id: data.id });

		return live;
	} catch (err) {
		console.log(err);
	}
}

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

const updateLiveStream = async (data) => {
	try {
		await livestreams().update(data.update).where({ stream_id: data.id });
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
	insertNewStreamer,
	getAllStreamersList,
	updateLiveStream,
	inserStreamerAtLiveCheckTime,
	getAllOficialStreamersList,
	getAllOficialStreamersLiveCheckList,
	getStreamerLive
}

