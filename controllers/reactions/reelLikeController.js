const ReelLike = require('../../models/reactions/ReelLike');
const User = require('../../models/User');
const Reel = require('../../models/Reel');

const addLike = async (req,res) => {

	const {userId,reelId} = req.params;

	try{

	    const result = await ReelLike.updateOne(
	    	{ user: userId, reel: reelId },
	    	{ $setOnInsert: {user: userId, reel: reelId}},
	    	{ upsert:true}
	    );
	    console.log(result);
	    if (result.upsertedCount === 0) {
	  		return res.status(400).json({ message: 'Like entry already exists' });
		}

	    await Reel.updateOne({ _id: reelId }, { $inc: { 'reactions.likes': 1 } });

	    return res.status(200).json({message:'Like added'});

    }
    catch(error){
    	console.log(error);
    	return res.status(400).json({ message: 'Failed to add like' });
    }

	
}

const removeLike = async (req, res) => {

	const {userId,reelId} = req.params;

	try{
		const removed = await ReelLike.deleteOne({user:userId,reel:reelId});

		if(removed.deletedCount === 0){ 
			return res.status(400).json({message:'Like not removed'});
		}

		await Reel.updateOne({ _id: reelId }, { $inc: { 'reactions.likes': -1 } });

		return res.status(200).json({ message: 'Like removed' });
	}
	catch(error){

		return res.status(400).json({message:'Failed to remove like'});
	} 

}

const getLikersByReelId = async (req,res) => {

	const {reelId} = req.params;

	const likers = await ReelLike.find({reel:reelId})
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
	getLikersByReelId
}