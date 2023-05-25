const Chat = require('../models/Chat');


const createChat = async (req,res) => {

}

const getAllChat = async (req,res) => {

	const {userId} = req.params;

	//Optimization needed -- fetch only latest one message
	 const chats = await Chat.find(

		{ participants:{ $in:[userId] } }


	)

	if(!chats){
		return res.status(400).json({message:'Chats not found'});
	}

	return res.status(200).json(chats);
}

const getAllMessages = async (req,res) =>{

	const {chatId} = req.params;

	//Optimization needed -- fetch only latest one message
	const messages = await Chat.find({_id:chatId});

	if(!messages){
		return res.status(400).json({message:'Messages not found'});
	}

	return res.status(200).json(messages);
}

const sendMessage = async (req,res) => {

}

module.exports = {
	createChat,
	getAllChat,
	getAllMessages,
	sendMessage,
}