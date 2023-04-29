const express = require('express');
const router = express.Router();
const passport = require('passport');
const authController = require('../controller/authController');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');

router.get('/', checkAuthenticated, authController.renderIndex);
router.get('/login', checkNotAuthenticated, authController.renderLogin);
router.post('/login', checkNotAuthenticated, authController.loginUser);
router.get('/register', checkNotAuthenticated, authController.renderRegister);
router.post('/register', checkNotAuthenticated, authController.registerUser);
router.get('/logout', authController.logout);

module.exports = router;
