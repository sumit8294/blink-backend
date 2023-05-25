const casual = require('casual');

const User = require('../models/User');
const Post = require('../models/Post');
const Follower = require('../models/Follower');
const Reel = require('../models/Reel');
const Story = require('../models/Story');
const Chat = require('../models/Chat');


//usage--

// 1.import generateRandoms.js inside index.js
//     const generateRandoms = require('./helpers/generateRandoms');

// 2.now use following functions after mongodb connected successfull

// if you want to pass your own username and images
// const images = ['http://image.jpg','http//image2.jpg'];
// const users = ['username1','username2'];

// generateRandoms.generateRandomUsers(10,images,users); 
// generateRandoms.generateRandomPosts(10,images);
// generateRandoms.generateRandomFollowers(10);
// generateRandoms.generateRandomReels(10,videos);


const generateRandomUsers = async (count, images, users) => {
  try {

    for (let i = 0; i < count; i++) {
      const user = new User({
        username: users && users[i] ? users[i] : casual.username,
        email: users && users[i] ? `${users[i]}@gmail.com` : casual.email,
        password: users && users[i] ? users[i] : casual.password,
        profile: images && images[i] ? images[i] : casual.url,
        bio: casual.sentences(n = 3),
        appSettings: {
          notification: casual.boolean,
          theme: casual.random_element(['light', 'dark']),
        },
        createdAt: casual.date(format = 'YYYY-MM-DD'),
        age: casual.integer(from = 18, to = 60),
      });

      await user.save();
      console.log(`User ${i + 1} saved:`, user);
    }

    console.log('Random user generation completed.');
  } catch (error) {
    console.error('Error generating random user:', error);
  } finally {
    console.log("proccess over");
  }
};

const generateRandomPosts = async (count, images) => {
  if (count > 50) {
    console.log("Count should not be more than 50!!");
    return;
  }
  try {
    for (let i = 0; i < count; i++) {
      const randomUser = await User.aggregate([{
        $sample: {
          size: 1
        }
      }]);
      const userId = randomUser[0]._id;

      const post = new Post({
        user: userId,
        imageUrl: images[i],
        caption: casual.sentence,
        reactions: {
          likes: casual.integer(from = 0, to = 100),
          comments: casual.integer(from = 0, to = 100),
          shares: casual.integer(from = 0, to = 100),
          bookmarks: casual.integer(from = 0, to = 100),
        },
        createdAt: casual.date(format = 'YYYY-MM-DD'),
      });

      await post.save();
      console.log(`Post ${i + 1} saved:`, post);
    }

    console.log('Random post generation completed.');
  } catch (error) {
    console.error('Error generating random post:', error);
  } finally {
    console.log("process over");
  }
};

const generateRandomReels = async (count, videos) => {
  if (count > 10) {
    console.log("Count should not be more than 10!!");
    return;
  }
  try {
    for (let i = 0; i < count; i++) {
      const randomUser = await User.aggregate([{
        $sample: {
          size: 1
        }
      }]);
      const userId = randomUser[0]._id;

      const reel = new Reel({
        user: userId,
        videoUrl: videos[i],
        title: casual.sentence,
        reactions: {
          likes: casual.integer(from = 0, to = 100),
          comments: casual.integer(from = 0, to = 100),
          shares: casual.integer(from = 0, to = 100),
          bookmarks: casual.integer(from = 0, to = 100),
        },
        createdAt: casual.date(format = 'YYYY-MM-DD'),
      });

      await reel.save();
      console.log(`Reel ${i + 1} saved:`, reel);
    }

    console.log('Random reels generation completed.');
  } catch (error) {
    console.error('Error generating random reels:', error);
  } finally {
    console.log("process over");
  }
};

const generateRandomStories = async (count, stories) => {
  if (count > 10) {
    console.log("Count should not be more than 10!!");
    return;
  }
  try {
    for (let i = 0; i < count; i++) {
      const randomUser = await User.aggregate([{
        $sample: {
          size: 1
        }
      }]);
      const userId = randomUser[0]._id;

      const existingUser = await Story.findOne({
        user: userId,
      });

      const story = (existingUser) 

      ? await Story.updateOne({
        user:userId,
        $set:{
          story: [
            ...existingUser.story,
            {
              storyUrl: stories[i],
              reaction:{
                likes: casual.integer(from = 0, to = 100),
              },
              createdAt: casual.date(format = 'YYYY-MM-DD'),
            }
          ]
        }
      })
      
      :
        new Story({
          user: userId,
          story: {
            storyUrl: stories[i],
            reaction:{
              likes: casual.integer(from = 0, to = 100),
            },
            createdAt: casual.date(format = 'YYYY-MM-DD'),
          }
          
        });
      
      if(!existingUser) {
        await story.save()
        console.log(`Story ${i + 1} saved:`, story);
      }
      else{
        console.log(`!! Story updated !!`);
      }

      
    }

    console.log('Random story generation completed.');
  } catch (error) {
    console.error('Error generating random stories:', error);
  } finally {
    console.log("process over");
  }
};


const generateRandomChats = async (count) => {
  if (count > 50) {
    console.log("Count should not be more than 50!!");
    return;
  }
  try {
    for (let i = 0; i < count; i++) {
      const randomUser = await User.aggregate([{
        $sample: {
          size: 2
        }
      }]);
      const participant1Id = randomUser[0]._id;
      const participant2Id = randomUser[1]._id;

      const existingParticipants = await Chat.findOne({
        
        participants:{
          $in:[
            [participant1Id,participant2Id],
            [participant2Id,participant1Id]
          ]
        },

      });

      const chat = (existingParticipants) 

      ? await Chat.updateOne({
        participants: existingParticipants.participants,
        $set:{
          messages: [
            ...existingParticipants.messages,
            {
              sender: casual.random_element([participant1Id, participant2Id]),
              content: casual.sentence,
              sendAt: casual.date(format = 'YYYY-MM-DD hh:m:s'),
            }
          ]
        }
      })
      
      :
        new Chat({
          participants: [participant1Id,participant2Id],
          messages: {
            sender: casual.random_element([participant1Id, participant2Id]),
            content: casual.sentence,
            sendAt: casual.date(format = 'YYYY-MM-DD hh:m:s'),
          },
          createdAt: casual.date(format = 'YYYY-MM-DD'),
          
        });
      
      if(!existingParticipants) {
        await chat.save()
        console.log(`Chats ${i + 1} saved:`, chat);  
      }else{
        console.log(`!! Chats updated !!`); 
      }

      
    }

    console.log('Random chats generation completed.');
  } catch (error) {
    console.error('Error generating random chats:', error);
  } finally {
    console.log("process over");
  }
};

const generateRandomFollowers = async (count) => {
  if (count > 50) {
    console.log("Count should not be more than 50!!");
    return;
  }

  try {
    for (let i = 0; i < count; i++) {
      const randomUsers = await User.aggregate([{
        $sample: {
          size: 2
        }
      }]);
      const user = randomUsers[0]._id;
      const follower = randomUsers[1]._id;

      const existingFollower = await Follower.findOne({
        user: user,
        follower: follower
      });

      if (existingFollower) {
        console.log(`Duplicate entry found for Follower ${i + 1}. Skipping.`);
        continue; // Move on to the next iteration if a duplicate entry exists
      }

      const followerObj = new Follower({
        user: user,
        follower: follower,
        createdAt: casual.date(format = 'YYYY-MM-DD'),
      });

      await followerObj.save();
      console.log(`Follower ${i + 1} saved:`, followerObj);
    }

    console.log('Random followers generation completed.');
  } catch (error) {
    console.error('Error generating random followers:', error);
  } finally {
    console.log('process over');
  }
};

module.exports = {
  generateRandomUsers,
  generateRandomPosts,
  generateRandomFollowers,
  generateRandomReels,
  generateRandomStories,
  generateRandomChats

};