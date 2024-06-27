const express = require('express');
const chatController = require('../controllers/chatController');


const verifyJWT = require('../middleware/verifyJWT')


const router = express.Router()
// router.use(verifyJWT)

router.post('/',chatController.createOrUpdateChats);
router.get('/:userId',chatController.getChatsByUserId);
router.get('/search/:queryName/:userId',chatController.getChatsFromSearch);
router.get('/:userId/:chatId',chatController.getMessagesByChatId);
router.delete('/messages',chatController.deleteMessagesFromChat);

module.exports = router;