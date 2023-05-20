const mongoose = require('mongoose');


const chatSchema = new mongoose.Schema({
	participants:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	],
	messages: [
		{
			sender: {type: mongoose.Schema.Types.ObejctId, ref: 'User'},
			content: {type: String},
		}
	],
	createdAt: { 
		type: Date,
		default: Date.now 
	},

})

const Chat = mongoose.model('chats',chatSchema);

module.exports = Chat;