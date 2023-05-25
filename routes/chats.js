const express = require('express');
const chatController = require('../controllers/chatController');


const router = express.Router();

router.post('/',chatController.createChat);
router.get('/:userId',chatController.getAllChat);
router.get('/chat/:chatId',chatController.getAllMessages);
router.post('/:chatId/send-message', chatController.sendMessage);

module.exports = router;