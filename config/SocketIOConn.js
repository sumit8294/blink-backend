const allowedOrigins = require('./allowedOrigins')
const { Server } = require("socket.io");

const {server} = require('./serverConfig')


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

io.on("connection", (socket) => {
    console.log(`User Connected: ${socket.id}`);
  

    socket.on("join_room",(data)=>{
        console.log(`joined to  ${data}`)
        socket.join(data)
    })

    socket.on("disconnect",()=>{
        console.log(`User Disconnected: ${socket.id}`)
    })
   
});

const sendMessage = async (data) =>{

    console.log("sended to room ", data.receiver)
    io.to(data.receiver).emit("send_message",data)  
}

const generateSocketRooms = async (userId,receiversRoomIds) =>{

	// io.on("connection", (socket) => {
    //     receiversRoomIds.forEach((receiver_id)=>{
    //         socket.join(String(receiver_id))
    //     })
    // })
	
}



module.exports = {io,generateSocketRooms,sendMessage}