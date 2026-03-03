const { projectMailer, convertDate } = require('./../utils/utilities');
module.exports = app => {
	const { insertNewTicketResponseRepository } = app.src.main.repository.TicketsRepository;

	const AdminTicketInsertNewResponseService = async (data, emailInfos) => {
		const newData = data;
		const resp = await insertNewTicketResponseRepository(newData);
		if (resp.status == 201) {
			try {
				projectMailer.TicketResponse(emailInfos.email, emailInfos.ticket_id, emailInfos.ticket_type, convertDate(emailInfos.response_date), emailInfos.link);
				console.log('email sent.')
			} catch (err) {
				console.log('error at trying to send ticketResponse email at: AdminTicketInsertNewResponseService, ', err)
			}
		}
		return { status: resp.status, message: resp.message }
	}
	return {
		AdminTicketInsertNewResponseService
	}
}