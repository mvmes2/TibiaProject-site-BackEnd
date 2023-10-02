const { streamers } = require('../../../models/SlaveModels');

const insertNewStreamer = async (data) => {
	try {
		await streamers().insert(data);
		return { status: 201, message: 'Created new streamer' }
	} catch (err) {
		console.log(err);
		return { status: 500, message: 'Internal error!' }
	}
}

const getAllStreamersList = async () => {
	try {
		const list = await streamers().select('*');
		return list;
	} catch (err) {
		console.log(err);
	}
}

const updateStreamer = async (data) => {
	try {
		await streamers().update(data.update).where({ stream_id: data.id });
	} catch (err) {
		console.log(err);
	}
}

module.exports = {
	insertNewStreamer,
	getAllStreamersList,
	updateStreamer
}

