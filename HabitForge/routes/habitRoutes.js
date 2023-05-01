const express = require('express');
const router = express.Router();
const habitController = require('../controller/habitController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.get('/add-habit', checkAuthenticated, (req, res) => {
  res.render('userhome/add-habit.ejs', { user: req.user });
});

router.post('/add-habit', checkAuthenticated, habitController.addHabit);
router.get('/userhome/edit-habit/:habitId', checkAuthenticated, habitController.editHabit);
router.post('/userhome/update-habit/:habitId', checkAuthenticated, habitController.updateHabit);
router.post('/delete-habit/:habitId', checkAuthenticated, habitController.deleteHabit);
router.get("/userhome/check-in/:habitId", checkAuthenticated, habitController.checkIn);

module.exports = router;
