const User = require('../models/User');
const Chat = require('../models/Chat');
const Reel = require('../models/Reel');
const Post = require('../models/Post');
const Message = require('../models/Message');
const {sendMessage} = require('../config/SocketIOConn')
const {sendPushNotification} = require('../config/webPushConfig')


//getChatsByUserId require to be add functionality for remove deleted messages

const createOrUpdateChats = async (req,res) => {

	const { receiver, sender, content, contentType, chatId } = req.body;
	let {username,profile} = await User.findOne({_id:sender});
	
	let newChat;
	
	let newChatId = null; // use if new chat has created between user

	let notification = {
		title: "",
		body: "",
		url: "",
		profile:""
	}

	const typeToLowerCase = contentType && contentType.toLowerCase();

	const [ receiverExists,senderExists ] = await Promise.all([

  		User.exists({ _id: receiver }),
  		User.exists({ _id: sender }),

	]);

	if( !senderExists || !receiverExists ) {

		return res.status(400).json({message: 'Participants are not valid'});
	}

	try{
		const isExistingParticipants = await Chat.findOne({
	        participants: {
				$in: [
					[sender, receiver],
					[receiver, sender],
				],
	        },
	    });
		
		if(contentType === 'post'){
			
			if(isExistingParticipants) {
				await saveNewMessage( {chatId:isExistingParticipants._id, sender, content:content.imageUrl, contentId:content._id, contentType:typeToLowerCase } )
			}else{
				await createNewChat( {sender, receiver, content:content.imageUrl, contentId:content._id, contentType:typeToLowerCase} )
			}
			
			notification = {
				title:username,
				profile,
				body: 'Sent you a Post.',
				chatId: newChat?._id || isExistingParticipants._id,
				receiver,
				url: 'messages'
			}

			await Post.updateOne({ _id: content._id }, { $inc: { 'reactions.shares': 1 } });
	    }
	    else if(contentType === 'reel'){
			
			if(isExistingParticipants) {
				await saveNewMessage( {chatId:isExistingParticipants._id, sender, content:content.videoUrl, contentId:content._id, contentType:typeToLowerCase } )
			}else{
				newChat = await createNewChat( {sender, receiver, content:content.videoUrl, contentId:content._id, contentType:typeToLowerCase} )
			}

			notification = {
				title:username,
				profile,
				body: 'Sent you a Reel.',
				chatId: newChat?._id || isExistingParticipants._id,
				receiver,
				url: 'messages'
			}

			await Reel.updateOne({ _id: content._id }, { $inc: { 'reactions.shares': 1 } });

	    }
	    else if(contentType === 'text'){

	    	if(isExistingParticipants) {
				await saveNewMessage( {chatId, sender, content, contentType:typeToLowerCase } )
			}else{
				newChat = await createNewChat( {sender, receiver, content, contentType:typeToLowerCase} )
			}

			notification = {
				title:username,
				profile,
				body: content,
				chatId: newChat?._id || chatId,
				receiver,
				url: 'messages'
			}
	    }

		
		await sendMessage(req.body) //socket.io functionality for sending message

		try{
			// Note- here we are not storing the notification in database 
			await sendPushNotification(notification) //sending notification with web-push
		}catch(err){
			console.log(err);
		}
	    return res.status(200).json({message:'Message sent successfully',newChatId});

	}
	catch(error){
		console.log(error)
	   	return res.status(400).json({message:error._message});
	}
    
}

const saveNewMessage = async (messageContent) =>{

	const message = new Message( {...messageContent} )

	const result = await message.save();

	await Chat.updateOne( {_id:messageContent.chatId} , { 
		lastMessageAt:result.sendAt,
		lastSeen: {
			sender: result.sender,
			seen: false
		}
	})
}

const createNewChat = async ({sender, receiver, content, contentType}) =>{

	const chat = new Chat({
		participants: [sender, receiver],
		createdAt: Date.now(),
		lastSeen: {
			sender: sender,
			seen: false
		}
	});

	const result = await chat.save();
	  
	const newMessage = new Message({
		  chatId: result._id,
		  sender,
		  content,
		  contentType,	
	})
	await newMessage.save();
}
 
const getChatsByUserId = async (req,res) => {

	const {userId} = req.params;

	const chats = await Chat.find({participants: {$in:[userId]}})
							.sort({lastMessageAt:-1})
							.populate({
								path:'participants',
								model: User,
								select: '_id username profile'
							});

	if(!chats?.length){
		return res.status(400).json({message:'Chats not found'});
	}
	
	const chatsWithLastMessage = await Promise.all(chats.map(async (chat)=>{
		const chatId = chat._id
		const message = await Message.findOne({chatId})
		.sort({sendAt:-1})
		.populate({
			path:'sender',
			model: User,
			select: '_id username profile'
		})
		
		if(userId === String(chat.participants[1]._id)){
			return {message,chatId,participants:chat.participants.splice(0,1),seen:chat.lastSeen}
		}else{
			return {message,chatId,participants:chat.participants.splice(1,1),seen:chat.lastSeen}
		}
	}))

	return res.status(200).json(chatsWithLastMessage);
}


const getChatsFromSearch = async (req,res) => {

	const {queryName,userId} = req.params;

	const searchedUsers = await User.find({username:{ $regex: queryName, $options: 'i' }})
	.select('_id username profile');


	const usersForChat = await Promise.all(searchedUsers.map(async (user)=>{

		const isExistingParticipants = await Chat.findOne({
	        participants: {
				$in: [
					[userId, user._id],
					[user._id, userId],
				],
	        },
	    });

		if(isExistingParticipants) {

			const chatId = isExistingParticipants._id;

			const message = await Message.findOne({chatId})
			.sort({sendAt:-1})
			.populate({
				path:'sender',
				model: User,
				select: '_id username profile'
			})

			return {message,chatId,participants:[user],seen:isExistingParticipants.lastSeen}
		}

		return {participants:[user]}
	}))

	return res.status(200).json(usersForChat);
}

const getMessagesByChatId = async (req,res) =>{


	// deleteBy filter require *********

	const {chatId} = req.params;

	// const loggedUserId = req.params.userId;

	// const chatHasloggedUserId = await Chat.exists({_id:chatId, participants: loggedUserId });

	// if(!chatHasloggedUserId){
	// 	return res.status(401).json({message:'Unauthorized'});
	// }

	const chat = await Chat.findOne({_id:chatId})
	.select('participants lastSeen')
	.populate({
		path: 'participants',
		model: User,
		select: '_id username profile'
	})

	if(!chat){
		return res.status(400).json({message:'Messages not found'});
	}

	if(req.params.userId === String(chat.participants[1]._id)){
		chat.participants.splice(1,1)
	}else{
		chat.participants.splice(0,1)
	}

	const messages = await Message.find({chatId})
	.sort({sendAt:1})
	.populate({
		path: 'sender',
		model: User,
		select: '_id username profile'
	});

	return res.status(200).json({chat,messages});
}

const deleteMessagesFromChat = async (req,res) => {

	const {messageIds, chatId, userId} = req.body;

	const loggedUserId = req.userId; // from session

	if(loggedUserId !== userId){
		return res.status(401).json({message:'Unauthorized'});
	}

	try {

		const response = await Chat.updateOne(
			{ _id: chatId },
			{ 
				$push: {
	          		'messages.$[elem].deletedBy': loggedUserId,
	        	},
			},
			{
		        arrayFilters: [
			          {
			            'elem._id': { $in: messageIds },
			          },
		        ],
	      	}
		)

		if (response.modifiedCount > 0) {

	      	return res.status(200).json({message:'Messages deleted successfully'});

	    } else {

	      	return res.status(400).json({message:'No messages were deleted'});
	    }
	}
	catch(err){
		
	    return res.status(500).json({message:'Error deleting messages:'});
	}
}

const getUnseenChatsCount = async (req,res) =>{

	const {userId} = req.params;

	const count = await Chat.count({participants: {$in:[userId]}, 'lastSeen.sender': {$ne:userId}, 'lastSeen.seen': false })

	return res.status(200).json({count});
}

const deleteChat = async (req,res) =>{

}

module.exports = {
	createOrUpdateChats,
	getChatsByUserId,
	getMessagesByChatId,
	deleteMessagesFromChat,
	deleteChat,
	getChatsFromSearch,
	getUnseenChatsCount,
}