const express = require('express');
const router = express.Router();
const friendController = require('../controller/friendController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get('/friends/index', checkAuthenticated, setCurrentPage('friends'), friendController.renderFriendsIndex);
router.get('/friends/add-friend', checkAuthenticated, friendController.renderAddFriend);
router.get('/friends/friend-requests', checkAuthenticated, friendController.renderFriendRequests);
router.post('/friends/search', checkAuthenticated, friendController.searchUsers);
router.get('/friends/follow/:id', checkAuthenticated, friendController.followUser);
router.get('/friends/accept/:id', checkAuthenticated, friendController.acceptFriend);
router.get('/friends/view/:id', checkAuthenticated, friendController.renderFriendHabits);
router.get('/friends/remove/:id', checkAuthenticated, friendController.removeFriend);
// router.get('/friends/index', checkAuthenticated, setCurrentPage('friends'), friendController.renderFriendsIndex);

module.exports = router;
