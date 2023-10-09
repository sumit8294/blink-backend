const Reel = require('../models/Reel');
const User = require('../models/User');
const Follower = require('../models/Follower');
const ReelLike = require('../models/reactions/ReelLike');
const Bookmark = require('../models/reactions/Bookmark');
const ReelComment = require('../models/reactions/ReelComment');

const cloudinaryConfig = require('../config/cloudinaryConfig');
const cloudinary = require("cloudinary").v2

const createReel = async (req,res) => {

	const { 

		public_id,
		version,
		signature,
		secure_url,
		video,
		userId,
		title,

	} = req.body;

	const expectedSignature = cloudinary.utils.api_sign_request({ public_id, version }, cloudinaryConfig.api_secret)

	if (expectedSignature !== signature) {	

		return res.status(403).json({message:'Forbidden'})
	}

	try{

		const reel = new Reel({
			user: userId,
			videoUrl: secure_url,
			title,
		})

		await reel.save();

		return res.status(201).json({message:'Reel created successfully'});
	}
	catch(error){
		return res.status(400).json({message:'Failed to create reel'});
	}
	

}


const updateReel = async (req,res) => {

}


const getAllReels = async (req,res) => {

	const {userId} = req.params;
	
	const reels = await Reel.find({}).populate({
		path: 'user',
		model: User,
		select: '_id username profile'
	});

	if(!reels){
		return res.status(404).json({message:'Reels not found'});
	}

	const followings = await Follower.find({follower:userId},{user:1,_id:0});
	const followingId = followings.map(following => following.user);

	const prepareReels = await Promise.all(reels.map(async (reel) => {

		reel._doc.likeState = Boolean(await ReelLike.exists({ reel: reel._id, user: userId }));
		reel._doc.bookmarkState = Boolean(await Bookmark.exists({ content: reel._id, user: userId }));
		reel._doc.comments = await ReelComment.find({user:userId,reel:reel._id})
		.limit(3)
		.populate({
		  path: 'user',
		  model: User,
		  select: '_id username profile',
		}).lean()
		reel._doc.mutualLikes = await ReelLike.find(
		{ reel: reel._id, $or: [ {user: { $in: followingId }}, {user: userId}] },
		{ user: 1, _id: 0 }
		)
		.populate({
		  path: 'user',
		  model: User,
		  select: '_id username profile',
		})
		.lean();

		return reel._doc;
	}));

	return res.status(200).json(prepareReels);
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