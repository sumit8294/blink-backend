const express = require('express');
const followerController = require('../controllers/followerController');

const router = express.Router();

router.post('/follow/:userId/:loggedUserId',followerController.follow);
router.delete('/unfollow/:userId/:loggedUserId',followerController.unfollow);
router.get('/following/:userId/:loggedUserId',followerController.getFollowings);
router.get('/:userId/:loggedUserId',followerController.getFollowers);

module.exports = router;