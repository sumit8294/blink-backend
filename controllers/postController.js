const Post = require('../models/Post');
const User = require('../models/User');
const Follower = require('../models/Follower');
const Like = require('../models/reactions/Like');
const Bookmark = require('../models/reactions/Bookmark');
const Comment = require('../models/reactions/Comment');

const cloudinaryConfig = require('../config/cloudinaryConfig');
const cloudinary = require("cloudinary").v2

const createPost = async (req,res) => {

	const { 

		public_id,
		version,
		signature,
		secure_url,
		image,
		userId,
		caption,

	} = req.body;

	// based on the public_id and the version that the (potentially malicious) user is submitting...
	// we can combine those values along with our SECRET key to see what we would expect the signature to be if it was innocent / valid / actually coming from Cloudinary
	const expectedSignature = cloudinary.utils.api_sign_request({ public_id, version }, cloudinaryConfig.api_secret)

	
	if (expectedSignature !== signature) {	

		return res.status(403).json({message:'Forbidden'})
	}

	try{
		const post = new Post({
			user: userId,
			imageUrl: secure_url,
			caption,
		})
		await post.save();
		return res.status(201).json({message:'Post created successfully'});

	}
	catch(error){
		return res.status(400).json({message:'Failed to create post'});
	}

}


const deletePostImageFromCloud = async (req,res,imageName) => {

	const filename = imageName;
	const lastDotIndex = filename.lastIndexOf('.');
	const filenameWithoutExtension = filename.substring(0, lastDotIndex);

	const cloudDeleteResponse = await cloudinary.uploader.destroy(filenameWithoutExtension);

	if(!cloudDeleteResponse){
		return res.status(400).json({message:'Image deletion failed from cloudinary'});
	}

	return res.status(200).json({message:'Image deleted from cloudinary'});
}


const getAllPosts = async (req,res) => {

	const {userId} = req.params;
	
	const posts = await Post.find({}).populate({
	    path: 'user',
	    model: User,
	    select: '_id username profile'
  	})


	if(!posts){
		return res.status(404).json({message:'Posts not found'});
	}

	const followings = await Follower.find({follower:userId},{user:1,_id:0});
	const followingId = followings.map(following => following.user);

	const preparePosts = await Promise.all(posts.map(async (post) => {

		post._doc.likeState = Boolean(await Like.exists({ post: post._id, user: userId }));
		post._doc.bookmarkState = Boolean(await Bookmark.exists({ content: post._id, user: userId }));
		post._doc.comments = await Comment.find({user:userId,post:post._id})
		.limit(3)
		.populate({
		  path: 'user',
		  model: User,
		  select: '_id username profile',
		}).lean()
		post._doc.mutualLikes = await Like.find(
		{ post: post._id, $or: [ {user: { $in: followingId }}, {user: userId}] },
		{ user: 1, _id: 0 }
		)
		.populate({
		  path: 'user',
		  model: User,
		  select: '_id username profile',
		})
		.lean();

		return post._doc;
	}));
	
	
	return res.status(200).json(preparePosts);
}


const getPostByUser = async (req,res) => {
	
	const {userId} = req.params;

	const userExists = await User.findOne({_id:userId}).lean().exec();

	if(!userExists){
		return res.status(404).json({message:'User not found'});
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

		const followers = await Follower.find({follower:userId});

		const followingId = followers.map(follower => follower.user);

		const posts = await Post.find({user:{$in:followingId}}).exec();

		return res.status(200).json(posts);

	}
	catch(error){

		return res.status(400).json({message:'Posts not Found'});
	}
								
}

const updatePost = () => {

}

const deletePostByUserId = async (req,res) => {

	const { postId, userId } = req.params;

	const loggedUserId = req.userId; //from session

	if(loggedUserId !== userId) {

		return res.status(401).json({message: 'Unauthorized request'});
	}

	const { imageUrl } = await Post.findOneAndDelete({ _id: postId, user: userId }, { projection: { imageUrl: 1 } });

	if(response.deletedCount > 0){

		// deletePostImageFromCloud(req,res,imageUrl);

		return res.status(200).json({message: 'Post deleted successfully'});
	}

	return res.status(403).json({message: 'Post not found or unauthorized'});
}

module.exports = {
	createPost,
	getAllPosts,
	getPostByUser,
	userFollowingPosts,
	updatePost,
	deletePostByUserId
}