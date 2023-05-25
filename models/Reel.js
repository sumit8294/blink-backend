const mongoose = require('mongoose');

const reelSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	videoUrl:{
		type: String,
		required: true,
	},
	title:{
		type: String,
	},
	reactions:{
		type: Object,
		default:{
			likes: 0,
			comments: 0,
			shares: 0,
			bookmarks: 0
		}
	},
	createdAt: { 
		type: Date,
		default: Date.now 
	},
});

const Reel = mongoose.model('reels',reelSchema);

module.exports = Reel;