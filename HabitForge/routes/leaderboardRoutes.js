const express = require('express');
const router = express.Router();
const leaderboardController = require('../controller/leaderboardController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

// router.post('/add-habit', checkAuthenticated, habitController.addHabit); nemoone

router.get("/leaderboard", checkAuthenticated, setCurrentPage('leaderboard'), leaderboardController.list)

router.post("/leaderboard", checkAuthenticated, leaderboardController.findAndAddFriend)

module.exports = router