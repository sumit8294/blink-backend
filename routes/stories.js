const express = require('express');
const storyController = require('../controllers/storyController');

const router = express.Router();

router.post('/', storyController.createStory);
router.get('/:storyId', storyController.getStory);
router.delete('/:storyId', storyController.deleteStory);
router.patch('/:storyId', storyController.updateStory);


module.exports = router;