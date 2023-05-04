const express = require('express');
const router = express.Router();
const feedController = require('../controller/feedController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

// router.post('/add-habit', checkAuthenticated, habitController.addHabit); nemoone

router.get("/feed", checkAuthenticated, setCurrentPage('feed'), feedController.list)

// router.post("/feed", checkAuthenticated, feedRoutes.findAndAddFriend)

module.exports = router