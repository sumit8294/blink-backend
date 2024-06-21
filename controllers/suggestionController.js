const User = require('../models/User')
const Follower = require('../models/Follower');
const { ObjectId } = require('mongodb');

const randomUserSuggestion = async (req,res) =>{
    const {userId} = req.params;
    
    try{
        const randomUsers = await User.aggregate([
            {$match:{_id: {$ne : new ObjectId(userId)}}},
            {$sample: {size:5}}
        ]);

        const followings = await Follower.find({follower:userId},{user:1}).lean();
        const followingIds = followings.map(item => item.user);
       
        const preparedRandomUsers = randomUsers.map(user => ({
            ...user,
            isFollowing: followingIds.some(id => new ObjectId(id).equals(user._id))
        }))

        
        return res.status(200).json(preparedRandomUsers);
    }
    catch{
        return res.status(400).json({message:"No Suggestions found!!"});
    }
    

    
}

module.exports = {
    randomUserSuggestion,
}