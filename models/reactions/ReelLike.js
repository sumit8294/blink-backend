const mongoose = require('mongoose');


const reelLikeSchema = new mongoose.Schema({

	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required:true
	},
	reel:{
		type: mongoose.Schema.Types.ObjectId,
		required:true
	},
	likedAt:{
		type:Date,
		default:Date.now
	}

})

const ReelLike = mongoose.model('reelLikes',reelLikeSchema);

module.exports = ReelLike