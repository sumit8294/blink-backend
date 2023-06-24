const Comment = require('../../models/reactions/Comment');
const User = require('../../models/User');
const Post = require('../../models/Post');

const addComment = async (req,res) => {

	const {userId,postId} = req.params;
	const {content} = req.body;

	try{

		const response = await Comment.create({user:userId,post:postId,content});

    	await Post.updateOne({ _id: postId }, { $inc: { 'reactions.comments': 1 } });

    	return res.status(200).json({message: 'comment added',commentId:response._id});
	}
	catch(error){

    	return res.status(400).json({ message: 'Failed to add Comment' });

	}

}

const removeComment = async (req, res) => {

	const {commentId,postId} = req.params;

	try{
		const removed = await Comment.deleteOne({_id:commentId});

		if(removed.deletedCount === 0){
			return res.status(400).json({message:'Comment not removed'});
		}

		await Post.updateOne({ _id: postId }, { $inc: { 'reactions.comments': -1 } });

		return res.status(200).json({ message: 'Comment removed' });
	}
	catch(error){

		return res.status(400).json({message:'Failed to remove Comment'});
	} 

}

const getCommentsByPostId = async (req,res) => {

	const {postId} = req.params;

	const comments = await Comment.find({post:postId})
	.populate({
		path: 'user',
		model: User,
		select: '_id profile username'
	})
	.lean();

	if(comments){
		return res.status(200).json(comments);
	}

	return res.status(400).json({message:'Comments not found'});

}

module.exports = {
	addComment,
	removeComment,
	getCommentsByPostId
}