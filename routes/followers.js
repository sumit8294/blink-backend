const express = require('express');
const followerController = require('../controllers/followerController');

const router = express.Router();

router.post('/follow',followerController.follow);
router.post('/unfollow',followerController.unfollow);
router.get('/following/:userId',followerController.getFollowings);
router.get('/followers/:userId',followerController.getFollowers);

module.exports = router;