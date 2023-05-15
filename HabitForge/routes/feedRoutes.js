const express = require('express');
const router = express.Router();
const feedController = require('../controller/feedController');
const { checkAuthenticated } = require('../middleware/authMiddleware');
const { setCurrentPage } = require('../middleware/setCurrentPageMiddleware');

router.get("/feed", checkAuthenticated, setCurrentPage('feed'), feedController.renderFeed);

module.exports = router