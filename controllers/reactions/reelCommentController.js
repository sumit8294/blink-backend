const ReelComment = require('../../models/reactions/ReelComment');
const User = require('../../models/User');
const Reel = require('../../models/Reel');

const addComment = async (req,res) => {

	const {userId,reelId} = req.params;
	const {content} = req.body;

	try{

		const response = await ReelComment.create({user:userId,reel:reelId,content});

    	await Reel.updateOne({ _id: reelId }, { $inc: { 'reactions.comments': 1 } });

    	return res.status(200).json({message: 'comment added',commentId:response._id});
	}
	catch(error){

    	return res.status(400).json({ message: 'Failed to add Comment' });

	}

}

const removeComment = async (req, res) => {

	const {commentId,reelId} = req.params;

	try{
		const removed = await ReelComment.deleteOne({_id:commentId});

		if(removed.deletedCount === 0){
			return res.status(400).json({message:'Comment not removed'});
		}

		await Reel.updateOne({ _id: reelId }, { $inc: { 'reactions.comments': -1 } });

		return res.status(200).json({ message: 'Comment removed' });
	}
	catch(error){

		return res.status(400).json({message:'Failed to remove Comment'});
	} 

}

const getCommentsByReelId = async (req,res) => {

	const {reelId} = req.params;

	const comments = await ReelComment.find({reel:reelId})
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
	getCommentsByReelId
}