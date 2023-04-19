let io;

const { createServer } = require("http");
const { Server } = require("socket.io");

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      // allowRequest: (req, callback) => {
      //   callback(null, req.headers.origin);
      // },
      cors: {
        origin: ["http://localhost:3001"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("socket.io is not initalized !");
    }
    return io;
  },
};
