const cron = require('node-cron');
const User = require('../models/User'); 
const Story = require('../models/Story');
const { ObjectId } = require('mongodb');

async function resetHasActiveStory() {
    try {
      const now = new Date();
  
      // const usersWithExpiredStories = await Story.aggregate([
      //   { $match: { expiresAt: { $lte: now } } },
      //   { $group: { _id: '$user' } }
      // ]);
      
  
      // for (const user of usersWithExpiredStories) {
      //   const userId = user._id;
  
      //   // Check if the user has any other active stories
      //   const activeStories = await Story.find({ user: userId, expiresAt: { $gt: now } });
  
      //   if (activeStories.length === 0) {
      //     await User.findByIdAndUpdate(userId, { has_active_story: false });
      //     console.log(`User ${userId} has no active stories. has_active_story set to false.`);
      //   }
      // }

      const userIds = await User.find({has_active_stories:true}).select('_id');
      for(id of userIds){
        const expiresTimes = await Story.findOne({user:new ObjectId(id)}).select('expiresAt').sort({expiresAt:-1});   
        if(expiresTimes.expiresAt < now){
          await User.findByIdAndUpdate(id,{has_active_stories:false});
          console.log(`User ${id} has no active stories. has_active_story set to false.`);
        }
      }
      
      // console.log("cron has scheduled")
    } catch (error) {
      console.error('Error checking and updating has_active_story:', error);
    }
}
  
  // Schedule the cron job to run every hour
  cron.schedule('* * * * *', resetHasActiveStory);