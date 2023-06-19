const mongoose = require('mongoose');


const commentSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	post:{
		type: mongoose.Schema.Types.ObjectId,
		required: true,
	},
	content:{
		type: String,
		required: true,
	},
	commentedAt:{
		type: Date,
		default: Date.now
	}
})

const Comment = mongoose.model('comments',commentSchema);

module.exports = Comment;