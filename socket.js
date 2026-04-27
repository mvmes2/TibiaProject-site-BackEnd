const { Server } = require("socket.io");

// Build allowed origins for both HTTP and Socket.IO from env. We accept a
// comma-separated list in CORS_ALLOWED_ORIGINS. If unset, we fall back to
// BASE_URL_IP_FRONT and a small dev whitelist so local development keeps working.
const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (raw && raw.trim().length > 0) {
    return raw.split(',').map(s => s.trim()).filter(Boolean);
  }
  const fallback = [
    process.env.BASE_URL_IP_FRONT,
    'http://localhost:3000',
    'http://localhost:3333',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3333',
  ].filter(Boolean);
  return fallback;
};

const ALLOWED_ORIGINS = parseAllowedOrigins();

const corsOriginCheck = (origin, callback) => {
  // Same-origin or non-browser requests (curl, server-to-server) have no Origin header.
  if (!origin) return callback(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

const io = new Server({
  cors: {
    origin: corsOriginCheck,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  }
});

module.exports = { io, ALLOWED_ORIGINS, corsOriginCheck };