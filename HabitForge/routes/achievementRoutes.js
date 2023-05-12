const express = require('express');
const router = express.Router();
const achievementController = require('../controller/achievementController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get("/achievements/index", checkAuthenticated, setCurrentPage('achievements'), achievementController.renderAchievements)

module.exports = router