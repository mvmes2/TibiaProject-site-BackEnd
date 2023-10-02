const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: '*',
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // credentials: false,
    // preflightContinue: true
  }
});

module.exports = { io };