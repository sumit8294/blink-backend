const Follower = require('../models/Follower');
const User = require('../models/User');


const follow = async (req,res) => {

	const {userId,followerId} = req.body;

	const loggedUserId = req.userId;// from session

	if(loggedUserId !== followerId){
		return res.status(403).json({message:'Forbidden'});
	}

	const userExists = await User.exists({_id:userId});

	if(!userExists){
		return res.status(404).json({message:'User not found'});
	}

	const response = await Follower.insertOne({user:userId,follower:followerId}).lean();

	if(!response){
		return res.status(400).json({message:'Failed to follow'});
	}

	return res.status(200).json({message:'Followed successfully'});
}


const unfollow = async (req,res) => {

	const {userId,followerId} = req.body;

	const loggedUserId = req.userId;// from session

	if(loggedUserId !== followerId){
		return res.status(403).json({message:'Forbidden'});
	}

	const userExists = await User.exists({_id:userId});

	if(!userExists){
		return res.status(404).json({message:'User not found'});
	}

	const response = await Follower.deleteOne({user:userId,follower:followerId}).lean();

	if(!response){
		return res.status(400).json({message:'Failed to unfollow'})
	}

	return res.status(200).json({message:'Unfollowed successfully'});
}


const getFollowings = async (req,res) => {

	const {userId} = req.param;

	const userExists = await User.exists({_id:userId});

	if(!userExists){
		return res.status(404).json({message:'User not found'});
	}

	const followings = await Follower.find({ follower: userId }).lean();

	if(!followings?.length){
		return res.status(400).json({message:'No followings found'})
	}

	return res.status(200).json(followings);
	
}


const getFollowers = async (req,res) => {

	const {userId} = req.param;

	const userExists = await User.exists({_id:userId});

	if(!userExists){
		return res.status(404).json({message:'User not found'});
	}

	const followings = await Follower.find({ user: userId }).lean();

	if(!followings?.length){
		return res.status(400).json({message:'No followers found'})
	}

	return res.status(200).json(followings);
	
}




module.exports = {
	follow,
	unfollow,
	getFollowings,
	getFollowers
}