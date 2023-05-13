const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');
const express = require('express');
const router = express.Router();
const leaderboardController = require('../controller/leaderboardController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.get('/leaderboard/public', checkAuthenticated, setCurrentPage('leaderboard'), leaderboardController.renderPublicLeaderboard);
router.get('/leaderboard/private', checkAuthenticated,  setCurrentPage('privateleaderboard'), leaderboardController.renderPrivateLeaderboard);

module.exports = router;