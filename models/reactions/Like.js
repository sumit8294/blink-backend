const mongoose = require('mongoose');


const likeSchema = new mongoose.Schema({

	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required:true
	},
	post:{
		type: mongoose.Schema.Types.ObjectId,
		required:true
	},
	likedAt:{
		type:Date,
		default:Date.now
	}

})

const Like = mongoose.model('likes',likeSchema);

module.exports = Like