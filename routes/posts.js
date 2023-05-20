const express = require('express');
const postController = require('../controllers/postController');


const router = express.Router();

router.post('/',postController.createPost);
router.get('/:postId',postController.getPost);
router.patch('/:postId',postController.updatePost);
router.delete('/:postId',postController.deletePost);


module.exports = router;