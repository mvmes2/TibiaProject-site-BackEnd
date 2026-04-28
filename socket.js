const { Server } = require("socket.io");

const normalizeOriginCandidate = (value) => {
  if (!value || typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    return trimmed;
  }
};

const expandOriginVariants = (origin) => {
  if (!origin) return [];

  try {
    const parsed = new URL(origin);
    const variants = new Set([parsed.origin]);
    const { protocol, port, hostname } = parsed;
    const isIpAddress = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
    const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1';

    if (!isIpAddress && !isLocalHost && hostname.includes('.')) {
      if (hostname.startsWith('www.')) {
        variants.add(`${protocol}//${hostname.slice(4)}${port ? `:${port}` : ''}`);
      } else {
        variants.add(`${protocol}//www.${hostname}${port ? `:${port}` : ''}`);
      }
    }

    return Array.from(variants);
  } catch {
    return [origin];
  }
};

const SOCKET_IO_PATH = process.env.SOCKET_IO_PATH || '/api/socket.io';

// Build allowed origins for both HTTP and Socket.IO from env. We accept a
// comma-separated list in CORS_ALLOWED_ORIGINS. If unset, we fall back to
// BASE_URL_IP_FRONT and a small dev whitelist so local development keeps working.
const parseAllowedOrigins = () => {
  const raw = process.env.CORS_ALLOWED_ORIGINS;
  if (raw && raw.trim().length > 0) {
    return Array.from(new Set(raw
      .split(',')
      .map(s => normalizeOriginCandidate(s))
      .filter(Boolean)
      .flatMap(expandOriginVariants)));
  }
  const fallback = [
    normalizeOriginCandidate(process.env.BASE_URL_IP_FRONT),
    normalizeOriginCandidate(process.env.BASE_URL_IP_BACK),
    'http://localhost:3000',
    'http://localhost:3333',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3333',
  ].filter(Boolean).flatMap(expandOriginVariants);
  return Array.from(new Set(fallback));
};

const ALLOWED_ORIGINS = parseAllowedOrigins();

const corsOriginCheck = (origin, callback) => {
  // Same-origin or non-browser requests (curl, server-to-server) have no Origin header.
  if (!origin) return callback(null, true);
  if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
  return callback(new Error(`Origin not allowed by CORS: ${origin}`));
};

const io = new Server({
  path: SOCKET_IO_PATH,
  cors: {
    origin: corsOriginCheck,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
  }
});

module.exports = { io, ALLOWED_ORIGINS, corsOriginCheck, SOCKET_IO_PATH };