const express = require('express');
const reelController = ('../controllers/reelController');


const router = express.Router();

router.post('/',reelController.createReel);
router.delete('/:reelId',reelController.delete);
router.patch('/:reelId',reelController.update);
router.get('/:reelId',reelController.getReels);

module.exports = router;