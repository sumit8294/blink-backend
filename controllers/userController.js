const User = require('../models/User')
const bcrypt = require('bcrypt')

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
	
	const users = await User.find().select('-password').lean();

	if (!users?.length) {
        return res.status(400).json({ message: 'No users found' })
    }

    res.status(200).json(users);
}

const getUser = async (req,res) =>{

	const {userId} = req.params;
	
	const user = await User.findOne({_id:userId}).lean();

	if(!user) {
		return res.status(400).json({message: 'User not found'});
	}

	res.status(200).json(user);
}


const deleteUser = async (req,res) =>{
	res.send({message:"not Added delete function yet"})
}

module.exports = {
	createUser,
	updateUser,
	getUser,
	getAllUsers,
	deleteUser
};