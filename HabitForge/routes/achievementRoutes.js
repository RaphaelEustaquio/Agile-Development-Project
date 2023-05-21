const express = require('express');
const router = express.Router();
const achievementController = require('../controller/achievementController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get("/achievements/index", checkAuthenticated, setCurrentPage('achievements'), achievementController.renderAchievements)
router.get("/achievements/trophies", checkAuthenticated, setCurrentPage('trophies'), achievementController.renderTrophies)
router.get("/achievements/trophy/:key", checkAuthenticated, setCurrentPage('trophy'), achievementController.renderTrophy)
module.exports = router