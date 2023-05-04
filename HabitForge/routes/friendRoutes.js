const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.get('/friends/index', checkAuthenticated, friendController.renderFriendsIndex);

// Add more friend-related routes here

module.exports = router;
