const mongoose = require('mongoose');


const bookmarkSchema = new mongoose.Schema({

	user:{
		type: mongoose.Schema.Types.ObjectId,
		required:true
	},
	content:{
		type: mongoose.Schema.Types.ObjectId,
		refPath: 'contentType',
		required:true
	},
	contentType:{
		type:  String,
		enum: ['Reel','Post'],
		required:true
	},
	bookmarkAt:{
		type:Date,
		default:Date.now
	}

})

const Bookmark = mongoose.model('bookmarks',bookmarkSchema);

module.exports = Bookmark