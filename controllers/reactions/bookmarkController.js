const Bookmark = require('../../models/reactions/Bookmark');
const Post = require('../../models/Post');
const Reel = require('../../models/Reel');

const addBookmark = async (req,res) => {

	try{

		const {contentId,userId,contentType} = req.params;
		const typeToUpperCase = contentType.charAt(0).toUpperCase() + contentType.slice(1);

		const data = {content:contentId,user:userId,contentType:typeToUpperCase};
		const result = await Bookmark.updateOne(
	    	data,
	    	{ $setOnInsert: data},
	    	{ upsert:true}
	    );

	    if (result.upsertedCount === 0) {
	  		return res.status(400).json({ message: 'Bookmark already added' });
		}


		if(typeToUpperCase === 'Post'){
			await Post.updateOne({_id:contentId},{$inc:{'reactions.bookmarks':1}});
		}
		else if(typeToUpperCase === 'Reel'){
			await Reel.updateOne({_id:contentId},{$inc:{'reactions.bookmarks':1}});
		}

		return res.status(200).json({message:'Bookmark added'});

	}
	catch(error){

		return res.status(400).json({message:'Failed to add bookmark'});
	}
}

const removeBookmark = async (req,res) => {

	try{
		const {contentId,userId,contentType} = req.params;
		const typeToUpperCase = contentType.charAt(0).toUpperCase() + contentType.slice(1);

		const removed = await Bookmark.deleteOne({content:contentId,user:userId,contentType:typeToUpperCase});

		if(removed.deletedCount === 0){ 
			return res.status(400).json({message:'Bookmark not removed'});
		}

		if(typeToUpperCase === 'Post'){
			await Post.updateOne({_id:contentId},{$inc:{'reactions.bookmarks':-1}});
		}
		else if(typeToUpperCase === 'Reel'){
			await Reel.updateOne({_id:contentId},{$inc:{'reactions.bookmarks':-1}});
		}

		return res.status(200).json({message:'Bookmark removed'});

	}
	catch(error){

		return res.status(400).json({message:'Failed to remove Bookmark'});
	}
}


const getBookmarksByUserId = async (req,res) => {

	try{
		const {userId,contentType} = req.params;
		let bookmarks = [];
		const typeToUpperCase = contentType.charAt(0).toUpperCase() + contentType.slice(1);

		if(typeToUpperCase === 'Post'){

			bookmarks = await Bookmark.find({contentType:'Post',user:userId})
			.populate({
				path:'content',
				model: Post
			})

		}else if(typeToUpperCase === 'Reel'){

			bookmarks = await Bookmark.find({contentType:'Reel',user:userId})
			.populate({
				path:'content',
				model: Reel
			})

		}

		return res.status(200).json(bookmarks);

	}
	catch(error){

		return res.status(400).json({message:'Failed to fetch Bookmark',error:error.message});
	}
}

module.exports = {
	addBookmark,
	removeBookmark,
	getBookmarksByUserId
}