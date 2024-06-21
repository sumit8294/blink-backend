const express = require('express');
const postController = require('../controllers/postController');
const verifyJWT = require('../middleware/verifyJWT');

const router = express.Router();

// router.use(verifyJWT);

router.post('/create',postController.createPost);
router.get('/:userId',postController.getAllPosts);
router.get('/user/:userId',postController.getPostByUser);
router.get('/:postId/:userId',postController.getPostById)

router.get('/following/:userId',postController.userFollowingPosts);
router.patch('/:postId',postController.updatePost);
router.delete('/:userId/:postId',postController.deletePostByUserId);
router.get('/random/:count/:userId',postController.getRandomPosts);


module.exports = router;


