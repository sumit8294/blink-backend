const User = require('../../models/User');
const Chat = require('../../models/Chat');


const createOrUpdateChats = async (req,res) => {

	const { reciever, sender, content, contentType } = req.body;

	const typeToLowerCase = contentType && contentType.toLowerCase();
	
	//const loggedUserId = req.userId; // from session
	// if( loggedUserId !== sender ) {
	// 	return res.status(403).json({message: 'Forbidden'})
	// }
	

	const [ senderExists, recieverExists ] = await Promise.all([

  		User.exists({ _id: sender }),
  		User.exists({ _id: reciever }),

	]);

	if( !senderExists || !recieverExists ) {

		return res.status(400).json({message: 'Participants are not valid'});
	}


	try{
		const isExistingParticipants = await Chat.findOne({
	        participants: {
				$in: [
					[sender, reciever],
					[reciever, sender],
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
			                	content,
			                	contentType:typeToLowerCase,
			                	deletedBy: [],
			                },
		            	},
		            }
	          	)
	        : new Chat({
		            participants: [sender, reciever],
		            messages: [
		              {
		                sender,
		                content,
		                contentType:typeToLowerCase,
		                deletedBy: [],
		              },
		            ],
		            createdAt: Date.now(),
	          	});

	    if (!isExistingParticipants) {

        	await chat.save();
        
      	} 

	    return res.status(200).json({message:'Message sent successfully'});

	}
	catch(error){
	   	return res.status(500).json({message:'Failed to send message',error:error.message});
	}
    
}


module.exports = {
	createOrUpdateChats
}