const express = require('express');
const postLikeController = require('../controllers/reactions/postLikeController');
const postCommentController = require('../controllers/reactions/postCommentController'); 
const reelLikeController = require('../controllers/reactions/reelLikeController');
const reelCommentController = require('../controllers/reactions/reelCommentController'); 

const bookmarkController = require('../controllers/reactions/bookmarkController');

const router = express.Router();


router.post('/like/post/:postId/:userId',postLikeController.addLike);
router.delete('/like/post/remove/:postId/:userId',postLikeController.removeLike);
router.get('/like/post/:postId/',postLikeController.getLikersByPostId);

router.post('/comment/post/:postId/:userId',postCommentController.addComment);
router.delete('/comment/remove/post/:postId/:commentId',postCommentController.removeComment);
router.get('/comment/post/:postId/',postCommentController.getCommentsByPostId);

router.post('/like/reel/:reelId/:userId',reelLikeController.addLike);
router.delete('/like/remove/reel/:reelId/:userId',reelLikeController.removeLike);
router.get('/like/reel/:reelId/',reelLikeController.getLikersByReelId);

router.post('/comment/reel/:reelId/:userId',reelCommentController.addComment);
router.delete('/comment/remove/reel/:reelId/:commentId',reelCommentController.removeComment);
router.get('/comment/reel/:reelId/',reelCommentController.getCommentsByReelId);

router.post('/bookmark/:contentType/:contentId/:userId',bookmarkController.addBookmark);
router.delete('/bookmark/remove/:contentType/:contentId/:userId',bookmarkController.removeBookmark);
router.get('/bookmark/:contentType/:userId/',bookmarkController.getBookmarksByUserId);


module.exports = router; 
