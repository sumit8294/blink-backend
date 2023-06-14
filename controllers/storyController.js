const Story = require('../models/Story');
const User = require('../models/User');
const Follower = require('../models/Follower');


const createStory = async (req,res) => {
	
}

const getAllStories = async (req,res) => {

	const stories = await Story.find().lean();

	if(!stories){
		return res.status(400).json({message:'Stories not found'});
	}

	return res.status(200).json(stories);
}

const getStoriesByUser = async (req,res) => {

	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'Not a valid User request'});
	}

	const stories = await Story.findOne({user:userId})
	.populate({
			path:'user',
			model:User,
			select:'_id profile username',
		})
	.lean()
	.exec();

	if(!stories){
		return res.status(400).json({message:'Stories not Found'});
	}

	return res.status(200).json(stories);
}
const userFollowingStories = async (req,res) => {

	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'Not a valid User request'});
	}

	try {

		const followers = await Follower.find({follower:userId}).exec();

		const followingIds = followers.map(follower => follower.user._id);

		const stories = await Story.find({user:{$in:followingIds}})
		.populate({
			path:'user',
			model:User,
			select:'_id profile username',
		})
		.lean()
		.exec();

		return res.status(200).json(stories);
	}
	catch{

		return res.status(400).json({message:'Stories not found'});
	}


}

const getActiveFollowingStories = async (req,res) => {

	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'Not a valid User request'});
	}

	try {

		const followers = await Follower.find({follower:userId});

		const followingIds = followers.map(follower => follower.user);


		const stories = await Story.find({user:{$in:followingIds}},{user:1})
		.populate({
			path : 'user',
			model: User,
			select: '_id username profile',
		}).lean();

		return res.status(200).json(stories);
	}
	catch{

		return res.status(400).json({message:'Stories not found'});
	}


}

const deleteStory = () => {

}

const updateStory = () => {

}

module.exports = {
	createStory,
	getAllStories,
	getStoriesByUser,
	userFollowingStories,
	getActiveFollowingStories,
	deleteStory,
	updateStory,
}