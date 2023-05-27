
const mongoose = require('mongoose');
const User = require('./User');
const chatSchema = new mongoose.Schema({
	participants:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	],
	messages: [
		{
			sender: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
			content: {type: String},
			sendAt: {
				type: Date,
				default: Date.now
			},
			deletedBy: [
		        {
		          type: mongoose.Schema.Types.ObjectId,
		          ref: 'User',
		        }
		    ]
		}
	],
	createdAt: { 
		type: Date,
		default: Date.now 
	},

})
 
const Chat = mongoose.model('chats',chatSchema);

module.exports = Chat;

