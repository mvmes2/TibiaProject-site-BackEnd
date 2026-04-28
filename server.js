require('newrelic');
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
process.chdir(__dirname);
const http = require('http');
const express = require('express');
const cors = require('cors');
const consign = require('consign');
const path = require('path');
const app = express();
const { io, ALLOWED_ORIGINS, corsOriginCheck, SOCKET_IO_PATH } = require('./socket');
const morgan = require('morgan');
const prismicH = require('@prismicio/helpers');
const compression = require('compression');
const fs = require('fs');
const RunCronCheckLives = require("./src/main/services/CronCheckLiveStreams");
const { syncDatabaseSchemas } = require('./syncDatabaseSchemas');
const server = http.createServer(app);
const rateLimit = require("express-rate-limit");

const DEFAULT_REQUEST_BODY_LIMIT = process.env.DEFAULT_REQUEST_BODY_LIMIT || '100kb';
const ADMIN_GUIDE_REQUEST_BODY_LIMIT = process.env.ADMIN_GUIDE_REQUEST_BODY_LIMIT || '50mb';

const isAdminGuideRequest = (req) => /^\/v1\/Admin\/guides(?:\/|$)/.test(req.url || req.path || '');

const defaultJsonParser = express.json({ limit: DEFAULT_REQUEST_BODY_LIMIT });
const adminGuideJsonParser = express.json({ limit: ADMIN_GUIDE_REQUEST_BODY_LIMIT });
const defaultUrlencodedParser = express.urlencoded({ extended: true, limit: DEFAULT_REQUEST_BODY_LIMIT });
const adminGuideUrlencodedParser = express.urlencoded({ extended: true, limit: ADMIN_GUIDE_REQUEST_BODY_LIMIT });

const requestBodyParser = (req, res, next) => {
  const parseUrlencoded = isAdminGuideRequest(req) ? adminGuideUrlencodedParser : defaultUrlencodedParser;
  const parseJson = isAdminGuideRequest(req) ? adminGuideJsonParser : defaultJsonParser;

  parseUrlencoded(req, res, (urlencodedErr) => {
    if (urlencodedErr) {
      return next(urlencodedErr);
    }

    parseJson(req, res, next);
  });
};

app.set('trust proxy', 1);

// Real CORS handling: replaces the previous wildcard middleware. We validate Origin
// against the allowlist built in socket.js (env-driven, dev-friendly defaults).
// IMPORTANT: CORS must be registered BEFORE rate-limit middlewares, otherwise a
// 429 response is emitted without `Access-Control-Allow-Origin` and the browser
// surfaces it to axios as a generic "Network Error" instead of a real HTTP 429.
app.use(cors({
  origin: corsOriginCheck,
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: false,
}));
app.options('*', cors({ origin: corsOriginCheck }));
console.log('[CORS] allowed origins:', ALLOWED_ORIGINS);
console.log('[socket.io] path:', SOCKET_IO_PATH);

const limiter = rateLimit({
  windowMs: 10 * 1000, // Define uma janela de 20 segundos
  max: 50, // Limite máximo de solicitações por IP na janela
  message: "Você atingiu o limite de solicitações. Tente novamente mais tarde.",
  keyGenerator: (req) => {
    const cfConnectingIp = req.headers['cf-connecting-ip'];
    if (typeof cfConnectingIp === 'string' && cfConnectingIp.trim()) {
      return cfConnectingIp.trim();
    }

    const xForwardedFor = req.headers['x-forwarded-for'];
    if (typeof xForwardedFor === 'string' && xForwardedFor.trim()) {
      return xForwardedFor.split(',')[0].trim();
    }

    return req.ip;
  },
  validate: {
    xForwardedForHeader: false,
  },
});

app.use(limiter);

// Stricter rate-limit dedicated to /v1/Admin/* routes. Admin is a tiny set of operators,
// so brute-force on login or poking around endpoints should be visibly throttled. The
// economy dashboard fans out ~4 parallel requests per refresh and reacts to a realtime
// poll, so 30/min is too tight in practice; 180/min still throttles abuse without
// breaking the legitimate admin workflow.
const adminLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  message: "Too many admin requests. Slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(['/v1/Admin', '/api/v1/Admin'], adminLimiter);

app.use((req, res, next) => {
  if (/^\/(?:api\/)?v1\/Admin\/economy(?:\/|$)/.test(req.url || '')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Surrogate-Control', 'no-store');
  }

  next();
});

const userSockets = {};

io.attach(server);

app.use(compression());

io.on("connection", (socket) => {
  console.log("Usuário conectado:", socket.id);

  socket.on("user_connected", ({ userId } = {}) => {
    // Sanitize input: only positive numeric ids. This event is the channel used by the
    // pix payment flow to deliver `payment_approved`. We do NOT trust an arbitrary string
    // and we keep a 1:1 relationship between socket and userId on this socket only.
    const numericUserId = Number(userId);
    if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
      return;
    }
    // Drop any previous socket mapping for this user (avoids stale routing).
    userSockets[numericUserId] = socket.id;
    socket.data.userId = numericUserId;
  });

  socket.on("disconnect", () => {
    const ownedUserId = socket.data && socket.data.userId;
    if (ownedUserId && userSockets[ownedUserId] === socket.id) {
      delete userSockets[ownedUserId];
    }
  });
});

// Admin namespace (Phase 3+): used by the admin dashboard to receive realtime
// economy/ticket updates. Auth happens at handshake via JWT signed with
// TOKEN_GENERATE_SECRET_ADMIN. Connections without a valid admin token are rejected
// before any event is wired up.
const { AdmintokenValidation } = require('./src/main/utils/utilities');
const adminNamespace = io.of('/admin');
adminNamespace.use((socket, next) => {
  try {
    const token = (socket.handshake.auth && socket.handshake.auth.token)
      || socket.handshake.headers['authorization'];
    if (!token) {
      return next(new Error('admin token required'));
    }
    const decoded = AdmintokenValidation(token);
    if (!decoded || !decoded.data) {
      return next(new Error('invalid admin token'));
    }
    const data = decoded.data;
    if (!(Number(data.type) > 3 && Number(data.web_flag) === 3)) {
      return next(new Error('not an admin'));
    }
    socket.data.adminId = data.id;
    socket.data.adminEmail = data.email;
    return next();
  } catch (err) {
    return next(new Error('admin auth failure'));
  }
});
adminNamespace.on('connection', (socket) => {
  console.log('[admin-socket] connected', socket.data.adminEmail || socket.data.adminId);
  socket.emit('economy:refresh', {
    reason: 'socket-connected',
  });
  socket.on('disconnect', () => {
    console.log('[admin-socket] disconnected', socket.data.adminEmail || socket.data.adminId);
  });
});

app.use((req, res, next) => {
  req.url = req.url.replace('/api', '');
  next();
});

app.use(requestBodyParser);

app.use('/v1/tickets-images/compressed', express.static(path.join(__dirname, 'src', 'main', 'resources', 'tickets-images', 'compressed')));
app.use('/v1/guild-logos/compressed', express.static(path.join(__dirname, 'src', 'main', 'resources', 'guild-logos', 'compressed')));
app.use('/guild-logos/compressed', express.static(path.join(__dirname, 'src', 'main', 'resources', 'guild-logos', 'compressed')));

function setCacheHeaders(req, res, next) {
  if (req.url.startsWith('/v1/tickets-images/compressed')) {
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 horas
  }
  next();
}
function setCacheHeaders(req, res, next) {
  if (req.url.startsWith('/v1/guild-logos/compressed')) {
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
app.use(morgan('dev'));

app.use(express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/downloads'));

app.get('/v1/client/version.txt', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'version.txt'));
});

app.get('/v1/downloads/launcher', (req, res) => {
  if (process.env.TESTSERVER_ON == 'true') {
    return res.status(401).send({ message: 'Download launcher is bloked right now, check news or discord news!!' });
  }

  const filePath = path.join(__dirname, 'downloads', 'tibiaproject_launcher.zip');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=tibiaproject_launcher.zip');

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

app.get('/v1/downloads/client', (req, res) => {
  if (process.env.TESTSERVER_ON == 'true') {
    return res.status(401).send({ message: 'Download client is bloked right now, check news or discord news!!' });
  }

  const filePath = path.join(__dirname, 'downloads', 'tibiaproject_client.rar');

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename=tibiaproject_client.rar');

  const readStream = fs.createReadStream(filePath);
  readStream.pipe(res);
});

io.on("connect_error", (error) => {
  console.log("Connection Error:", error);
});

module.exports = {
  io,
  userSockets,
  adminNamespace,
};

const loadApplicationModules = () => {
  consign()
    .then("./src/main/config/prismicConfig.js")
    .then("./src/main/utils")
    .then("./src/main/modules/twitch/repository")
    .then("./src/main/modules/twitch")
    .then("./src/main/middlewares")
    .then("./src/main/repository")
    .then("./src/main/modules/mercadoPago/repository")
    .then("./src/main/modules/mercadoPago/services")
    .then("./src/main/modules/mercadoPago/")
    .then("./src/main/services")
    .then("./src/main/controllers")
    .then("./src/main/modules/stripes/repository")
    .then("./src/main/modules/stripes/services")
    .then("./src/main/modules/stripes/")
    .then("./src/main/modules/pagSeguro/repository")
    .then("./src/main/modules/pagSeguro/controllers")
    .then("./src/main/modules/pagSeguro")
    .then("./src/main/config/Routes.js")
    .into(app);
};

const startServer = async () => {
  await syncDatabaseSchemas();
  loadApplicationModules();

  const PORT = Number(process.env.PORT) || 8880;
  server.listen(PORT, () => {
    // RunCronCheckLives.start();
    console.log(`BackEnd Rodando na porta: ${PORT}!!`);
    try {
      const EconomyRealtimeService = require('./src/main/services/EconomyRealtimeService');
      EconomyRealtimeService.start(adminNamespace);
      console.log('[EconomyRealtimeService] started, broadcasting on /admin namespace.');
    } catch (err) {
      console.error('[EconomyRealtimeService] failed to start:', err && err.message);
    }
  });
};

startServer().catch((err) => {
  console.error('Failed to sync database schemas on startup:', err);
  process.exit(1);
});
