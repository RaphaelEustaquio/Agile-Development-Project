const express = require('express');
const router = express.Router();
const feedController = require('../controller/feedController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

// router.post('/add-habit', checkAuthenticated, habitController.addHabit); nemoone

router.get("/feed", checkAuthenticated, feedController.list)

// router.post("/feed", checkAuthenticated, feedRoutes.findAndAddFriend)

module.exports = router