const fs = require('fs');
const path = require('path');
const { internalApi } = require('./../services/InternalApi');

module.exports = app => {

	const GetClientVersionRequest = async (req, res) => {
		const filePath = path.join('client', 'version.txt');

		// try {
		// 	const resp = await internalApi.get('/Admin-get-client-version', { headers: { authorization: req.headers.authorization } });
		// 	console.log('o que vem de resp? ', resp.status);
		// 	res.status(resp.status).send(resp.data);
		// } catch (err) {
		// 	console.log(err.response.data);
		// 	res.status(401).send(err.response.data);
		// }

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

		// try {
		// 	const data = req.body
		// 	const resp = await internalApi.post('/Admin-update-client-version', data, { headers: { authorization: req.headers.authorization } });
		// 	console.log('o que vem no resp do update? ', resp.data);
		// 	res.status(resp.status).send(resp.data);
		// } catch (err) {
		// 	console.log(err.response.data);
		// }

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