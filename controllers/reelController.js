const Reel = require('../models/Reel');
const User = require('../models/User');
const Follower = require('../models/Follower');

const createReel = () => {

}

const deleteReel = () => {

}

const updateReel = () => {

}

const getAllReels = async (req,res) => {

	const reels = await Reel.find({});

	if(!reels){
		return res.status(404).json({message:'Reels not found'});
	}

	return res.status(200).json(reels);
}

const getReelByUser = async (req,res) => {
	
	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'User not found'});
	}

	const userReels = await Reel.find({user:userId});

	if(!userReels){
		return res.status(404).json({message:'Reels not found'});
	}

	return res.status(200).json(userReels);
}

const userFollowingReels = async (req,res) => {

	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'User not found'});
	}

	try{

		const followers = await Follower.find({follower:userId}).populate().exec();

		const followingId = followers.map(follower => follower.user._id);

		const reels = await Reel.find({user:{$in:followingId}}).exec();

		return res.status(200).json(reels);

	}
	catch(error){

		return res.status(400).json({message:'Reels not Found'});
	}
								
}

module.exports = {
	createReel,
	deleteReel,
	updateReel,
	getAllReels,
	getReelByUser,
	userFollowingReels,
}