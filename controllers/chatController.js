const User = require('../models/User');
const Chat = require('../models/Chat');
const Reel = require('../models/Reel');
const Post = require('../models/Post');


//getChatsByUserId require to be add functionality for remove deleted messages

const createOrUpdateChats = async (req,res) => {

	const { receiver, sender, content, contentType } = req.body;

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

		const chat = isExistingParticipants
	        ? await Chat.updateOne(

		            {participants: isExistingParticipants.participants},

		            {
		            	$push: {
			                messages: {
			                	sender,
			                	content:content.imageUrl,
			                	contentType:typeToLowerCase,
			                	deletedBy: [],
			                },
		            	},
		            }
	          	)
	        : new Chat({
		            participants: [sender, receiver],
		            messages: [
		              {
		                sender,
		                content:content.imageUrl,
		                contentType:typeToLowerCase,
		                deletedBy: [],
		              },
		            ],
		            createdAt: Date.now(),
	          	});

	    if (!isExistingParticipants) {

        	await chat.save();
        
      	}
      	if(typeToLowerCase === 'post'){

      		await Post.updateOne({ _id: content._id }, { $inc: { 'reactions.shares': 1 } });
      	}
      	if(typeToLowerCase === 'reel'){

      		await Reel.updateOne({ _id: content._id }, { $inc: { 'reactions.shares': 1 } });
      	}

	    return res.status(200).json({message:'Message sent successfully'});

	}
	catch(error){
	   	return res.status(400).json({message:'Failed to send message'});
	}
    
}
 
const getChatsByUserId = async (req,res) => {

	const {userId} = req.params;

	// const loggedUserId = req.userId;

	// if(userId !== loggedUserId){
	// 	return res.status(401).json({message:'Unauthorized'});
	// }

	const userExists = await User.exists({_id:userId});

	if(!userExists){
		return res.status(404).json({message:'User not found'});
	}

	const chats = await Chat.find({ participants:{ $in:[userId] } })
	.sort({'messages.sendAt':-1})
	.populate([
		{
		    path: 'participants',
		    model: User,
		    select: '_id username profile'
	  	},
	  	{
		    path: 'messages.sender',
		    model: User,
		    select: '_id username profile'
	  	},
  	])
  	.lean();

	if(!chats?.length){
		return res.status(400).json({message:'Chats not found'});
	}

	chats.forEach(chat => {
    	chat.messages.sort((a, b) => b.sendAt - a.sendAt);
    	chat.messages = chat.messages.slice(0, 1);

    	if(userId !== String(chat.participants[0]._id)){
    		chat.participants.splice(1,1);

    	} else{
    		chat.participants.splice(0,1);
    	} 

    });

	return res.status(200).json(chats);
}

const getMessagesByChatId = async (req,res) =>{


	// deleteBy filter require *********

	const {chatId} = req.params;

	// const loggedUserId = req.params.userId;

	// const chatHasloggedUserId = await Chat.exists({_id:chatId, participants: loggedUserId });

	// if(!chatHasloggedUserId){
	// 	return res.status(401).json({message:'Unauthorized'});
	// }

	let chat = await Chat.findOne({
		_id:chatId,
	})
	.populate([
		{
		    path: 'participants',
		    model: User,
		    select: '_id username profile'
	  	},
	  	{
	  		path: 'messages.sender',
	  		model: User,
	  		select: '_id username profile'
	  	},
  	])
  	.lean();

	if(!chat){
		return res.status(400).json({message:'Messages not found'});
	}

    // chat.messages.sort((a, b) => b.sendAt - a.sendAt); // working fine without this

    if(req.params.userId !== String(chat.participants[0]._id)){
    	chat.participants.splice(1,1);

    } else {
    	chat.participants.splice(0,1);
    }


	return res.status(200).json(chat);
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

		console.log(response);

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

const deleteChat = async (req,res) =>{

}

module.exports = {
	createOrUpdateChats,
	getChatsByUserId,
	getMessagesByChatId,
	deleteMessagesFromChat,
	deleteChat,
}