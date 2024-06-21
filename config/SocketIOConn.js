const allowedOrigins = require('./allowedOrigins')
const { Server } = require("socket.io");

const socketConnection = (server) =>{
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
                    callback(null, true)
                } else {
                    callback(new Error('Not allowed by CORS'))
                }
            },
          methods: ["GET", "POST"],
        },
      });
    return io;
}

module.exports = {socketConnection}