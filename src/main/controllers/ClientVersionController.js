const fs = require('fs');
const path = require('path');

module.exports = app => {

	const GetClientVersionRequest = async (req, res) => {
		const filePath = path.join('client', 'version.txt');

		try {
			fs.readFile(filePath, 'utf8', (error, conteudo) => {
				if (error) {
					throw new Error(error)
				} else {
					console.log('Conteúdo do arquivo (assíncrono):', conteudo);
					res.status(200).send({ message: conteudo });
				}
			});
		} catch (err) {
			console.log('Erro ao ler o arquivo em GetClientVersionRequest: ', err);
		}
	}

	const UpdateClientVersionRequest = async (req, res) => {
		const data = req.body
		const filePath = path.join('client', 'version.txt');

		try {
			fs.writeFile(filePath, data.content, (error) => {
				if (error) {
					throw new Error(error)
				} else {
					res.status(201).send({ message: 'ok' });
				}
			});
		} catch (err) {
			console.log('Erro ao escrever no arquivo em UpdateClientVersionRequest: ', err);
		}
	}


	return {
		GetClientVersionRequest,
		UpdateClientVersionRequest
	}
}