const express = require('express');
const reelController = require('../controllers/reelController');


const router = express.Router();

router.post('/create',reelController.createReel);
router.get('/:userId',reelController.getAllReels);
router.get('/:reelId/:userId',reelController.getReelById)
router.delete('/:userId/:reelId',reelController.deleteReelByUserId);
router.patch('/:reelId',reelController.updateReel);
router.get('/user/:userId',reelController.getReelByUser);
router.get('/following/:userId',reelController.userFollowingReels);


module.exports = router;