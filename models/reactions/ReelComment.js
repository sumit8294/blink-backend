const mongoose = require('mongoose');


const reelCommentSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	reel:{
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

const ReelComment = mongoose.model('reelComments',reelCommentSchema);

module.exports = ReelComment;