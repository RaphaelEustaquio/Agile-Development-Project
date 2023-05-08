const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get('/friends/index', checkAuthenticated, setCurrentPage('friends'), friendController.renderFriendsIndex);
router.get('/friends/add-friend', checkAuthenticated, friendController.renderAddFriend);
router.post('/friends/search', checkAuthenticated, friendController.searchUsers);
router.get('/friends/follow/:id', checkAuthenticated, friendController.followUser);
// router.get('/friends/index', checkAuthenticated, setCurrentPage('friends'), friendController.renderFriendsIndex);

module.exports = router;
