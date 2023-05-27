const Reel = require('../models/Reel');
const User = require('../models/User');
const Follower = require('../models/Follower');

const createReel = async (req,res) => {

	const { 

		public_id,
		version,
		signature,
		videoName, 
		userId,
		title,
		createdAt,

	} = req.body;

	const expectedSignature = cloudinary.utils.api_sign_request({ public_id, version }, cloudinaryConfig.api_secret)

	
	if (expectedSignature !== signature) {	

		return res.status(403).json({message:'Forbidden'})
	}

	const reel = new Reel({

		user: userId,
		videoUrl: imageName,
		title,
		createdAt,
	})

	const response = await reel.save();

	if(!response){
		return res.status(400).json({message:'Failed to create reel'});
	}

	return res.status(201).json({message:'Reel created successfully'});

}


const updateReel = async (req,res) => {

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


const deleteReelByUserId = async (req,res) => {

	const { reelId, userId } = req.params;

	const loggedUserId = req.userId; //from session

	if(loggedUserId !== userId) {

		return res.status(401).json({message: 'Unauthorized request'});
	}
	
	const { videoUrl } = await Reel.findOneAndDelete({ _id: reelId, user: userId }, { projection: { videoUrl: 1 } });

	if(response.deletedCount > 0){

		// deleteReelImageFromCloud(req,res,videoUrl);

		return res.status(200).json({message: 'Reel deleted successfully'});
	}

	return res.status(403).json({message: 'Reel not found or unauthorized'});
}

module.exports = {
	createReel,
	deleteReelByUserId,
	updateReel,
	getAllReels,
	getReelByUser,
	userFollowingReels,
}