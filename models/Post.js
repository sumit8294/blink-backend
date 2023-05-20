const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	imageUrl:{
		type: String,
		required: true,
	},
	caption:{
		type: String,
		required: true,
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

const Post = mongoose.model('posts',postSchema);
module.exports = Post;