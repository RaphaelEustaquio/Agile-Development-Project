const express = require('express');
const router = express.Router();
const achievementController = require('../controller/achievementController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get('/achievements/index', checkAuthenticated, setCurrentPage('achievements'), achievementController.renderAchievements);
router.get('/achievements/trophies', checkAuthenticated, setCurrentPage('trophies'), achievementController.getTrophies);
router.get('/achievements/trophy/:id', checkAuthenticated, setCurrentPage('trophy'), achievementController.getTrophy);
router.post('/achievements/trophy/:trophyId/mark-seen', checkAuthenticated, setCurrentPage('trophy'), achievementController.markTrophyAsSeen);

module.exports = router;
