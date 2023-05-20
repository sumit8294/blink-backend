const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
	name:{
		type: String,
		required: true,
	},
	email:{
		type: String,
	    required: true,
	    unique: true,
	    trim: true,
	    lowercase: true,
	    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
	},
	password:{
		type: String,
		required: true,
	},
	bio:{
		type: String,
	},
	appSettings:{
		type: Object,
		default: {notification:true, theme:"dark"}
	},
	createdAt: { 
		type: Date,
		default: Date.now 
	},
});

const User = mongoose.model('users',userSchema);
module.exports = User;