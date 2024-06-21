const User = require('../models/User')
const Follower = require('../models/Follower')
const bcrypt = require('bcrypt')
const {ObjectId} = require('mongodb');

const createUser = async (req,res) =>{

	const {username,email,password} = req.body;

	if (!username || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const usernameExists = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec();
    const emailExists = await User.findOne({ email }).collation({ locale: 'en', strength: 2 }).lean().exec();

    if (emailExists) {
        return res.status(409).json({ message: 'Email already exists !' });
    }
    else if(usernameExists){
        return res.status(409).json({ message: 'Username already exists !' });
    }

    const hashedPwd = await bcrypt.hash(password, 10);

	const userObject = {username,email,"password":hashedPwd};


	const result = await User.create(userObject);

	if(result){
		return res.status(201).json({message: `User ${username} Created`});
	}

	return res.status(400).json({message: 'Invalid user data received'});
	
}

const updateUser = async (req,res) =>{
	res.send({message:"not Added update function yet"})
}

const getAllUsers = async (req,res) =>{
	
	const {loggedUserId} = req.params;

	const users = await User.find().select('-password').limit(10).lean();

	if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    const followings = await Follower.find({follower:loggedUserId},{user:1}).lean();
    const followingIds = followings.map(item => item.user)

    const preparedUsers = users.map(user => ({
		...user,
		isFollowing: followingIds.some(id => new ObjectId(id).equals(user._id))
    }))

    res.status(200).json(preparedUsers);
}

const getUser = async (req,res) =>{

	const {userId,loggedUserId} = req.params;
	
	const user = await User.findOne({_id:userId}).select('-password').lean();

	if(!user) {
		return res.status(400).json({message: 'User not found'});
	}

	user.isFollowing = Boolean( await Follower.exists({user:userId,follower:loggedUserId}))
	user.isFollower = Boolean( await Follower.exists({user:loggedUserId,follower:userId}))

	res.status(200).json(user);
}


const deleteUser = async (req,res) =>{
	res.send({message:"not Added delete function yet"})
}

const updateSettings = async (req,res) =>{
	const data = req.body;
	const {userId} = req.params;
	let user = await User.findOne({_id:userId}).lean();

	updateObject = {
		...user,
		profile: `${data.fileUrl}`,
		bio: data.bio,
		username: data.name,
	} 

	await User.findOneAndUpdate({ _id:userId }, updateObject, { new: true });

	res.status(200).json({message:'user settings updated'})
}

const getSettings = async (req,res) =>{
	
	const {userId} = req.params;
	let user = await User.findOne({_id:userId}).select('profile bio username').lean();
	
	if(!user){
		res.status(400).json({message:'user not found'});
	}
	res.status(200).json(user);
}

module.exports = {
	createUser,
	updateUser,
	getUser,
	getAllUsers,
	deleteUser,
	updateSettings,
	getSettings
};