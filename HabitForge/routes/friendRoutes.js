const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get('/friends/index', checkAuthenticated, setCurrentPage('friends'), friendController.renderFriendsIndex);

// Add more friend-related routes here

module.exports = router;
