const express = require('express');
const chatController = require('../controllers/chatController');


const router = express.Router();

router.post('/',chatController.createChat);
router.get('/:chatId',chatController.getChat);
router.post('/:chatId/send-message', chatController.sendMessage);

module.exports = router;