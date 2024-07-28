const Story = require('../models/Story');
const User = require('../models/User');
const Follower = require('../models/Follower');
const cloudinary = require('cloudinary').v2;
const cloudinaryConfig = require('../config/cloudinaryConfig')
const {ObjectId} = require('mongodb')

const createStory = async (req,res) => {
	
	const {
		public_id,
		version,
		signature,
		image,
		secure_url,
		userId,
	} = req.body;

	const expectedSignature = cloudinary.utils.api_sign_request({ public_id, version }, cloudinaryConfig.api_secret)

	if(signature !== expectedSignature){
		return res.status(403).json({message:'Invalid cloud signature'})
	}

	try{
		const newStory = new Story({
			user:userId,
			story:image,
			expiresAt: new Date( Date.now() + 30 * 24 * 60 * 60 * 1000)
		})

		await newStory.save();

		// await User.findByIdAndUpdate(userId,{has_active_stories:true})

		return res.status(201).json({message:'Story created successfully'})
	}
	catch(error){
		return res.status(400).json({message:'Failed to create story'})
	}
	

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
	const stories = await Story.find({user:userId,expiresAt:{$gte: new Date()}}) 
	//const stories = await Story.find({user:userId})
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
	const preparedStories = [];
		let index = -1;
		let temp = null;

		stories.forEach((item) => {
		  if (new ObjectId(item.user._id).equals(temp)) {
		    // Add the story to the existing group
		    preparedStories[index].story.push(item.story);
		  } else {
		    index++;
		    // Create a new group for the user
		    preparedStories[index] = {
		      ...item,
		      story: [item.story],
		    };
		    temp = new ObjectId(item.user._id);
		  }
		});

	

	return res.status(200).json(preparedStories);
}
const userFollowingStories = async (req,res) => {

	const {userId} = req.params;

	try {

		const followings = await Follower.find({follower:userId}).exec();

		const followingIds = followings.map(follower => follower.user);

		const stories = await Story.find({user:{$in:followingIds},expiresAt:{$gte: new Date()}}) //----------> still need to make a condition where only past 24 hours stories are fetched 
		//const stories = await Story.find({user:{$in:followingIds}}) 
		.populate({
			path:'user',
			model:User,
			select:'_id profile username',
		})
		.sort({user:1})
		.lean()
		.exec();
		// console.log(stories);
		const preparedStories = [];
		let index = -1;
		let temp = null;

		stories.forEach((item) => {
		  if (new ObjectId(item.user._id).equals(temp)) {
		    // Add the story to the existing group
		    preparedStories[index].story.push(item.story);
		  } else {
		    index++;
		    // Create a new group for the user
		    preparedStories[index] = {
		      ...item,
		      story: [item.story],
		    };
		    temp = new ObjectId(item.user._id);
		  }
		});
		// preparedStories.forEach((item)=>{
		// 	console.log(item[0]?.user,item)
		// })

		return res.status(200).json(preparedStories);
	}
	catch(error){
		console.log(error)
		return res.status(400).json({message:'Stories not found'});
	}


}

const getActiveFollowingStories = async (req,res) => {

	const {userId} = req.params;

	
	try {
		
		const followings = await Follower.find({follower:userId},{user:1,_id:0});
		
		const followingIds = followings.map(follower => follower.user);
		
		// const storiesIds = await Story.find({user:{$in:followingIds}}).sort({user:1}).distinct('user');
		
		// const preparedStoriesIds = await Promise.all(storiesIds.map(async item => {
		// 	const expiresTimes = await Story.findOne({user: new ObjectId(item)}).select('expiresAt').sort({expiresAt: -1});
		// 	return expiresTimes && expiresTimes.expiresAt < new Date();
		// }));
		
		// const validStoriesIds = storiesIds.filter((_,index) =>preparedStoriesIds[index]);
		
		
		const currentDateTime = new Date();
		
		// Step 1: Find users with active stories and check expiration
		const activeUsersWithStories = await Story.aggregate([
		{ $match: { user: { $in: followingIds } } },
		{ $sort: { user: 1, expiresAt: -1 } },
		{
			$group: {
			_id: '$user',
			latestExpiresAt: { $first: '$expiresAt' }
		}
	},
		{ $match: { latestExpiresAt: { $gt: currentDateTime } } },
		{ $project: { _id: 1 } }
	]);
	
	// Step 2: Extract user IDs
	const activeUserIds = activeUsersWithStories.map(doc => doc._id);
	
	const stories = await User.find({_id:{$in:activeUserIds}}).select('_id profile username').lean()
	return res.status(200).json(stories);
}
	catch(error){

		return res.status(400).json({message:'Stories not found',error});
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
