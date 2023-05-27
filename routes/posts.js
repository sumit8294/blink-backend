const express = require('express');
const postController = require('../controllers/postController');


const router = express.Router();

router.post('/create',postController.createPost);
router.get('/',postController.getAllPosts);
router.get('/user/:userId',postController.getPostByUser);
router.get('/following/:userId',postController.userFollowingPosts);
router.patch('/:postId',postController.updatePost);
router.delete('/:userId/:postId',postController.deletePostByUserId);


module.exports = router;


