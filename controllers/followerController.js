const Follower = require('../models/Follower');
const User = require('../models/User');
const {ObjectId} = require('mongodb')

const follow = async (req,res) => {

	const {userId,loggedUserId} = req.params;
	// const response = await Follower.create({user:userId,follower:loggedUserId}).lean();
	try{
		const response = await Follower.updateOne(
		    	{ user: userId, follower:loggedUserId },
		    	{ $setOnInsert: { user: userId, follower:loggedUserId } },
		    	{ upsert:true}
		);

	    if (response.upsertedCount === 0) {
	  		return res.status(400).json({ message: 'Follow entry already exists' });
		}

		await User.updateOne({_id:userId},{$inc:{followers:1}})
		await User.updateOne({_id:loggedUserId},{$inc:{followings:1}})

		return res.status(200).json({message:'Followed successfully'});
	}
	catch(error){
		return res.status(400).json({message:'Failed to follow'});

	}

}


const unfollow = async (req,res) => {

	const {userId,loggedUserId} = req.params;

	const response = await Follower.deleteOne({user:userId,follower:loggedUserId}).lean();

	if(response.deletedCount === 0){
		return res.status(400).json({message:'Failed to unfollow'})
	}

	await User.updateOne({_id:userId},{$inc:{followers:-1}})
	await User.updateOne({_id:loggedUserId},{$inc:{followings:-1}})

	return res.status(200).json({message:'Unfollowed successfully'});
}


const getFollowings = async (req,res) => {

	const {userId,loggedUserId} = req.params;
	
	try{
		const followings = await Follower.find({ follower: userId },{user:1})
		.populate({
			path: 'user',
			model: User,
			select: '_id profile username'
		})
		.lean();

		if(!followings?.length){
			return res.status(200).json(followings);
		}

	    const loggedUserFollowings = await Follower.find({follower:loggedUserId},{user:1}).lean();
	    const loggedUserFollowingsIds = loggedUserFollowings.map(item => item.user)

	    const preparedFollowings = followings.map(item => ({
			...item,
			isFollowing: loggedUserFollowingsIds.some(id => new ObjectId(id).equals(item.user._id))
			//isFollowing is for loggedUser
	    }))

	    return res.status(200).json(preparedFollowings);
	}
	catch(error){
		return res.status(400).json({message:'Failed to fetch followings'})
	}

	
	
}


const getFollowers = async (req,res) => {

	const {userId,loggedUserId} = req.params;

	try{

		const followers = await Follower.find({ user: userId },{follower:1})
		.populate({
			path: 'follower',
			model: User,
			select: '_id profile username'
		})
		.lean();

		if(!followers?.length){
			return res.status(200).json(followers);
		}

		const loggedUserFollowers = await Follower.find({follower:loggedUserId},{user:1}).lean();
	    const loggedUserFollowersIds = loggedUserFollowers.map(item => item.user)

	    const preparedFollowers = followers.map(followerItem => ({
			...followerItem,
			isFollowing: loggedUserFollowersIds.some(id => new ObjectId(id).equals(followerItem.follower._id))
			//isFollowing is for loggedUser
	    }))

		return res.status(200).json(preparedFollowers);
	}
	catch(error){
		return res.status(400).json({message:'Failed to fetch followers'})
	}
}




module.exports = {
	follow,
	unfollow,
	getFollowings,
	getFollowers
}