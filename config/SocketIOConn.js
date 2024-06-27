const allowedOrigins = require('./allowedOrigins')
const { Server } = require("socket.io");

const {server} = require('./serverConfig');
const Chat = require('../models/Chat')

const onlineUsers = new Map();

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
  
    socket.on("join_room", async (userId)=>{
        console.log(`joined to  ${userId}`)
        socket.join(userId)
        
        onlineUsers.set(userId)
        const userConnections = await fetchConnections(userId);
        userConnections.forEach((connection)=>{
            if(onlineUsers.has(connection)){
                socket.to(connection).emit('getOnlineUser',userId)
                io.to(userId).emit('getOnlineUser',connection)
            }
        })
       
    })

    socket.on("disconnect",async ()=>{
        console.log(`User Disconnected: ${socket.id}`)

        const userId = socket.handshake.query.userId

        onlineUsers.delete(userId)

        const userConnections = await fetchConnections(userId);
        userConnections.forEach((connection)=>{
            if(onlineUsers.has(connection)){
                socket.to(connection).emit('getOfflineUser',userId)
            }
        })
        
    })
   
});


const fetchConnections = async (userId) =>{
    const userConnections = await Chat.find({participants: {$in:[userId]}}).select('participants')

    const filterConnections = userConnections.map((connection)=>{
        const users = connection.participants
        if(String(users[0]) === userId) return String(users[1])
        else return String(users[0])
    })

    return filterConnections;
}

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