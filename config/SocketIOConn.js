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

        console.log(`user ${socket.id} joined to  ${userId}`)

        socket.join(userId)
        
        onlineUsers.set(userId)

        const userConnections = await fetchConnections(userId);

        userConnections.forEach((connection)=>{

            if(onlineUsers.has(connection)){

                //tell each friend that this user is online
                socket.to(connection).emit('getOnlineUser',userId)

                //tell this user who is online currently
                io.to(userId).emit('getOnlineUser',connection)

            }
        })

        socket.on('videoCallOffer', async ({ offerTo, offerFrom, offer }) => {
            console.log("Caal to", offerTo)
            socket.to(offerTo).emit('videoCallOffer',{offerFrom, offer})
        })
    
        socket.on('videoCallAnswer', async ({ answerTo, answer }) => {
            console.log("answer to",answerTo)
            socket.to(answerTo).emit('videoCallAnswer',{answerTo, answer})
        })

        socket.on('ice-candidate', ({candidate,to}) => {
            socket.to(to).emit('ice-candidate',{candidate});
        })
       
    })



    socket.on('lastMessageSeened', async ({ chatId, sender }) => {

        const result = await Chat.updateOne({_id:chatId},{lastSeen:{sender,seen:true}})

        if(result) io.to(sender).emit('notifyMessageSeened',"message seened")

    });

    socket.on("disconnect",async ()=>{

        console.log(`User Disconnected: ${socket.id}`)

        const userId = socket.handshake.query.userId

        const userConnections = await fetchConnections(userId);

        onlineUsers.delete(userId)

        userConnections.forEach((connection)=>{

            if(onlineUsers.has(connection)) socket.to(connection).emit('getOfflineUser',userId) 

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

    io.to(data.receiver).emit("send_message",data)

}



module.exports = {io,sendMessage}