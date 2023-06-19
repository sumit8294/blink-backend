const express = require('express');
const likeController = require('../controllers/reactions/likeController');
const commentController = require('../controllers/reactions/commentController'); 
const bookmarkController = require('../controllers/reactions/bookmarkController'); 
const shareController = require('../controllers/reactions/shareController'); 




const router = express.Router();


router.post('/like/:postId/:userId',likeController.addLike);
router.delete('/like/remove/:postId/:userId',likeController.removeLike);
router.get('/like/:postId/',likeController.getLikersByPostId);

router.post('/comment/:postId/:userId',commentController.addComment);
router.delete('/comment/remove/:postId/:commentId',commentController.removeComment);
router.get('/comment/:postId/',commentController.getCommentsByPostId);

router.post('/bookmark/:contentType/:contentId/:userId',bookmarkController.addBookmark);
router.delete('/bookmark/remove/:contentType/:contentId/:userId',bookmarkController.removeBookmark);
router.get('/bookmark/:contentType/:userId/',bookmarkController.getBookmarksByUserId);

router.post('/share',shareController.createOrUpdateChats);


module.exports = router; 
