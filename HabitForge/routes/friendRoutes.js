const express = require('express');
const router = express.Router();
const { checkAuthenticated } = require('../middleware/authMiddleware');

// New route for rendering the "My Friends" page
router.get('/friends', checkAuthenticated, (req, res) => {
    res.render('userhome/friends.ejs', { user: req.user });
});

// Add more friend-related routes here

module.exports = router;
