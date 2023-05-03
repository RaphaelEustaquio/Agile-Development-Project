const express = require('express');
const router = express.Router();
const socialController = require('../controller/socialController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

// router.post('/add-habit', checkAuthenticated, habitController.addHabit); nemoone

router.get("/friends", checkAuthenticated, socialController.list)

router.post("/friends", checkAuthenticated, socialController.findAndAddFriend)

module.exports = router