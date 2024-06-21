const express = require('express');
const suggestionController = require('../controllers/suggestionController');

const router = express.Router();

router.get('/random/:userId',suggestionController.randomUserSuggestion);

module.exports = router