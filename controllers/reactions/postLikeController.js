const Like = require('../../models/reactions/Like');
const User = require('../../models/User');
const Post = require('../../models/Post');

const addLike = async (req,res) => {

	const {userId,postId} = req.params;

	try{

	    const result = await Like.updateOne(
	    	{ user: userId, post: postId },
	    	{ $setOnInsert: {user: userId, post: postId}},
	    	{ upsert:true}
	    );

	    if (result.upsertedCount === 0) {
	  		return res.status(400).json({ message: 'Like entry already exists' });
		}

	    await Post.updateOne({ _id: postId }, { $inc: { 'reactions.likes': 1 } });

	    return res.status(200).json({message:'Like added'});

    }
    catch(error){

    	return res.status(400).json({ message: 'Failed to add like' });
    }

	
}

const removeLike = async (req, res) => {

	const {userId,postId} = req.params;

	try{
		const removed = await Like.deleteOne({user:userId,post:postId});

		if(removed.deletedCount === 0){ 
			return res.status(400).json({message:'Like not removed'});
		}

		await Post.updateOne({ _id: postId }, { $inc: { 'reactions.likes': -1 } });

		return res.status(200).json({ message: 'Like removed' });
	}
	catch(error){

		return res.status(400).json({message:'Failed to remove like'});
	} 

}

const getLikersByPostId = async (req,res) => {

	const {postId} = req.params;

	const likers = await Like.find({post:postId})
	.populate({
		path: 'user',
		model: User,
		select: '_id profile username'
	})
	.lean();

	if(likers){
		return res.status(200).json(likers);
	}

	return res.status(400).json({message:'likes not found'});

}

module.exports = {
	addLike,
	removeLike,
	getLikersByPostId
}