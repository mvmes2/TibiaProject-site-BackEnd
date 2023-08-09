const http = require('http');
const express = require('express');
const cors = require('cors');
const consign = require('consign');
const path = require('path');
const app = express();
const { io } = require('./socket');
const morgan = require('morgan');
const prismicH = require('@prismicio/helpers');
const compression = require('compression');
const fs = require('fs');

const server = http.createServer(app);

const userSockets = {};

io.attach(server);

app.use(compression());

app.use((req, res, next) => {
  req.url = req.url.replace('/api', '');
  next();
});

app.use('/tickets-images/compressed', express.static(path.join(__dirname, 'src', 'main', 'resources', 'tickets-images', 'compressed')));

function setCacheHeaders(req, res, next) {
  if (req.url.startsWith('/tickets-images/compressed')) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 horas
  }
  next();
}

app.use(setCacheHeaders);

app.use((req, res, next) => {
  res.locals.ctx = {
    prismicH,
  }
  next()
})
app.use(express.json());
app.use(morgan('dev'));

const corsOptions = {
  origin: '*', // Substitua por sua URL de origem
  methods: 'GET,HEAD,PUT,POST,DELETE',
  optionsSuccessStatus: 200, // Para navegadores legados (IE11, várias versões do Android)
};

app.use(cors(corsOptions));

app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/downloads'));

app.get('/client/version.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'version.txt'));
});
app.get('/downloads', (req, res) => {
  const filePath = path.join(__dirname, 'downloads', 'tibiaproject_launcher.zip');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=tibiaproject_launcher.zip');

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

io.on("connection", (socket) => {
    console.log("Usuário conectado:", socket.id);

    socket.on("user_connected", ({ userId }) => {
        console.log("Usuário conectado com ID:", userId, "e socket ID:", socket.id);
        userSockets[userId] = socket.id;
      console.log("Objeto userSockets atualizado:", userSockets);
    });

    socket.on("disconnect", () => {
      console.log("Usuário desconectado:", socket.id);

      // remova a associação do id do usuario do socket
      const userId = Object.keys(userSockets).find((key) => userSockets[key] === socket.id);
      if (userId) {
        delete userSockets[userId];
        console.log(userSockets)
      }
    });
  });

module.exports = {
  io,
  userSockets,
};

consign()
  .then("./src/main/config/prismicConfig.js")
  .then("./src/main/utils")
  .then("./src/main/middlewares")
  .then("./src/main/modules/mercadoPago/repository")
  .then("./src/main/modules/mercadoPago/services")
  .then("./src/main/modules/mercadoPago/")
  .then("./src/main/modules/stripes/repository")
  .then("./src/main/modules/stripes/services")
  .then("./src/main/modules/stripes/")
  .then("./src/main/modules/paypal/repository")
  .then("./src/main/modules/paypal/controllers")
  .then("./src/main/modules/paypal/")
  .then("./src/main/repository")
  .then("./src/main/services")
  .then("./src/main/controllers")
  .then("./src/main/config/Routes.js")
  .into(app);

const PORT = 3333;
server.listen(PORT, () => {
    console.log(`BackEnd Rodando na porta: ${PORT}!!`);
});
