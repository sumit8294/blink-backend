
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
			contentId: {
				type: mongoose.Schema.Types.ObjectId,
				default: null
			},
			sendAt: {
				type: Date,
				default: Date.now
			},
			contentType:{
				type:String,
				enum: ['text','post','reel'],
				required: true,
				default: 'text'

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

