const express = require('express');
const cors = require('cors');
const consign = require('consign');
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
    console.log('Host Log: req vindo de: ',req.headers.host)
    const allowedOrigin = "localhost:3333"; //origem permitida para se solicitar requisições da nossa api.
    req.header("Access-Control-Allow-Origin", allowedOrigin);

    //garantia de que apenas allowed origin consegue fazer requisições a nossa api.
    if (req.headers.host === allowedOrigin) {
		next();
	} else {
		res.status(401).send('f')
	}
});

    consign()
    .then("./src/main/utils")
    .then("./src/main/repository")
    .then("./src/main/services")
    .then("./src/main/controllers")
    .then("./src/main/config/Routes.js")
    .into(app);

const PORT = 3333;

app.listen(PORT, () => {
    console.log(`BackEnd Rodando na porta: ${PORT}!!`);
})

