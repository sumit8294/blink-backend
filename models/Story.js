const mongoose = require('mongoose');


const storySchema = new mongoose.Schema({
	user:{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	story:{
		type:String
	},
	reactions:{
		type: Object,
		default:{
			likes:0,
		}
	},
	createdAt: { 
		type: Date,
		default: Date.now 
	},
	
});

const Story = mongoose.model('stories',storySchema);

module.exports = Story;