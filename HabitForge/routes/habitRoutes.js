const express = require('express');
const router = express.Router();
const habitController = require('../controller/habitController');
const { checkAuthenticated } = require('../middleware/authMiddleware');

router.post('/add-habit', checkAuthenticated, habitController.addHabit);
router.get('/userhome/edit-habit/:habitId', checkAuthenticated, habitController.editHabit);
router.post('/userhome/update-habit/:habitId', checkAuthenticated, habitController.updateHabit);
router.post('/delete-habit/:habitId', checkAuthenticated, habitController.deleteHabit);

module.exports = router;
