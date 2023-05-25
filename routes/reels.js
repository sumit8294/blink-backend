const express = require('express');
const reelController = require('../controllers/reelController');


const router = express.Router();

router.post('/',reelController.createReel);
router.delete('/:reelId',reelController.deleteReel);
router.patch('/:reelId',reelController.updateReel);
router.get('/',reelController.getAllReels);
router.get('/user/:userId',reelController.getReelByUser);
router.get('/following/:userId',reelController.userFollowingReels);


module.exports = router;