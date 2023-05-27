const express = require('express');
const cloudinaryController = require('../controllers/cloudinaryController');

const router = express.Router();

router.get('/get-signature',cloudinaryController.getSignature);


module.exports = router;