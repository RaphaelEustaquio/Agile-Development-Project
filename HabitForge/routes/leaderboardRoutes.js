const express = require('express');
const router = express.Router();
const leaderboardController = require('../controller/leaderboardController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

// router.post('/add-habit', checkAuthenticated, habitController.addHabit); nemoone

router.get("/leaderboard", checkAuthenticated, leaderboardController.list)

router.post("/leaderboard", checkAuthenticated, leaderboardController.findAndAddFriend)

module.exports = router