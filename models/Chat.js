
const mongoose = require('mongoose');
const User = require('./User');
const chatSchema = new mongoose.Schema({
	participants:[
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	],
	createdAt: { 
		type: Date,
		default: Date.now 
	},
	lastMessageAt: {
		type: Date,
		default: Date.now,
	},

})

chatSchema.index({ participants: 1 });
chatSchema.index({ lastMessageAt: -1 });
 
const Chat = mongoose.model('chats',chatSchema);

module.exports = Chat;

