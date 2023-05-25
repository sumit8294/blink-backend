const express = require('express');
const storyController = require('../controllers/storyController');

const router = express.Router();

router.post('/', storyController.createStory);
router.get('/', storyController.getAllStories);
router.get('/user/:userId', storyController.getStoriesByUser);
router.get('/following/:userId', storyController.userFollowingStories);
router.delete('/:storyId', storyController.deleteStory);
router.patch('/:storyId', storyController.updateStory);

  
module.exports = router;