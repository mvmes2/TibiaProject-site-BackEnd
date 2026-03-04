const fs = require('fs');
const path = require('path');
const { internalApi } = require('./../services/InternalApi');

module.exports = app => {

	const GetClientVersionRequest = async (req, res) => {
		const filePath = path.join('client', 'version.txt');

		fs.readFile(filePath, 'utf8', (error, conteudo) => {
			if (error) {
				console.log('Erro ao ler o arquivo em GetClientVersionRequest: ', error);
				return res.status(500).send({ message: 'Internal error!' });
			}

			console.log('Conteúdo do arquivo (assíncrono):', conteudo);
			return res.status(200).send({ message: conteudo });
		});
	}

	const UpdateClientVersionRequest = async (req, res) => {
		const data = req.body
		const filePath = path.join('client', 'version.txt');

		fs.writeFile(filePath, data.content, (error) => {
			if (error) {
				console.log('Erro ao escrever no arquivo em UpdateClientVersionRequest: ', error);
				return res.status(500).send({ message: 'Internal error!' });
			}

			return res.status(201).send({ message: 'ok' });
		});
	}


	return {
		GetClientVersionRequest,
		UpdateClientVersionRequest
	}
}