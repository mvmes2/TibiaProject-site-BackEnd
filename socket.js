const { Server } = require("socket.io");

const io = new Server({
  cors: {
    origin: ["https://tibiaproject.com", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // credentials: false,
    // preflightContinue: true
  }
});

module.exports = { io };