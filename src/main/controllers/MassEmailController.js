const fs = require('fs');
const path = require('path');

module.exports = app => {
	const moment = require('moment');

	const { GetWorldsListService, getAllWorldsCharactersService } = app.src.main.services.WorldsService;
	const { getWorldWideTopFivePlayersRepository, getAllPlayersFromWorld } = app.src.main.repository.WorldsRepository;

	const createEmailHtmlController = async (req, res) => {
		const data = req.body;
		console.log('como ta vindo data? ', data);
		if (data) {
			try {
				const fileName = data.fileName;
				console.log('filename ', data.fileName);
				const htmlContent = JSON.parse(req.body.rawHtml);
				const directoryPath = path.join(__dirname, './../resources/emailTemplates/massEmailTemplate');
				if (!fs.existsSync(directoryPath)) {
					fs.mkdirSync(directoryPath, { recursive: true });
				  }
				const filePath = path.join(directoryPath, fileName);
				fs.writeFileSync(filePath, htmlContent);
				return res.status(200).send({ message: 'Arquivo HTML criado com sucesso' });
			} catch (err) {
				console.log('erro ao tentar criar arquivo html na func: createEmailHtmlController, ', err);
				return res.status(500).send({ message: 'Internal error!' });
			}
		}
		return res.status(400).send({ message: 'No body content!' })
    }



	return {
		createEmailHtmlController,
	}
}