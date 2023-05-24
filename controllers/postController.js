const Post = require('../models/Post');
const User = require('../models/User');
const Follower = require('../models/Follower');

const createPost = async (req,res) => {

}

const getAllPosts = async (req,res) => {

	const posts = await Post.find({});

	if(!posts){
		return res.status(404).json({message:'Posts not found'});
	}

	return res.status(200).json(posts);
}

const getPostByUser = async (req,res) => {
	
	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'User not found'});
	}

	const userPosts = await Post.find({user:userId});

	if(!userPosts){
		return res.status(404).json({message:'Posts not found'});
	}

	return res.status(200).json(userPosts);
}

const userFollowingPosts = async (req,res) => {

	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(401).json({message:'User not found'});
	}

	try{

		const followers = await Follower.find({follower:userId}).populate().exec();

		const followingId = followers.map(follower => follower.user._id);

		const posts = await Post.find({user:{$in:followingId}}).exec();

		return res.status(200).json(posts);

	}
	catch(error){

		return res.status(400).json({message:'Posts not Found'});
	}
								
}

const updatePost = () => {

}

const deletePost = () => {

}

module.exports = {
	createPost,
	getAllPosts,
	getPostByUser,
	userFollowingPosts,
	updatePost,
	deletePost
}