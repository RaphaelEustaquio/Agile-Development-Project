const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.get('/friends/index', checkAuthenticated, friendController.renderFriendsIndex);
router.get('/friends/add-friend', checkAuthenticated, friendController.renderAddFriend);
router.post('/friends/search', checkAuthenticated, friendController.searchUsers);

module.exports = router;
