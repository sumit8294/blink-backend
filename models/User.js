const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({
	username:{
		type: String,
		unique: true,
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
	profile:{
		type: String,
	},
	followers:{
		type: Number,
		default: 0,
	},
	followings:{
		type:Number,
		default: 0,
	},
	posts:{
		type:Number,
		default: 0,
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
	age: {
		type: Number,
	}
});

const User = mongoose.model('users',userSchema);
module.exports = User;


  