const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const habitController = require('../controller/habitController.js'); 

const renderIndex = async (req, res) => {
  if (req.user) {
    const user = await prisma.user.findUnique({
      where: { 
        id: req.user.id 
      },
      include: {
        habits: true,
      }
    });
    await habitController.checkMissedHabits(user);
    await habitController.updateUserPoints(user, 0);
    const trees = await prisma.tree.findMany();
    res.render('userhome/index.ejs', { user, levelingThresholds: habitController.levelingThresholds, trees: trees });
  }
  else {
    const trees = await prisma.tree.findMany();
    res.render('userhome/index.ejs', { user: req.user, levelingThresholds: habitController.levelingThresholds, trees: trees });
  }
};

const renderLogin = (req, res) => {
    res.render('auth/login.ejs');
};

const loginUser = (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('auth/login.ejs', { errorMessage: info.message });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      if(req.user) { // Checking if req.user is defined
        await habitController.checkMissedHabits(req.user);
      }
      return res.redirect('/');
    });
  })(req, res, next);
};

const renderRegister = (req, res) => {
    res.render('auth/register.ejs');
};

const registerUser = async (req, res) => {
  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: req.body.email
      }
    });
    if (existingUser) {
      return res.status(400).send('Email already taken');
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        level: 1,
        points: 0,
        remainingPoints: 0,
      },
    });
    res.redirect('/login');
  } catch (error) {
      console.error(error);
      res.status(500).send('Error in user registration.');
  }
};

const logout = (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
};

module.exports = { renderIndex, renderLogin, loginUser, renderRegister, registerUser, logout };
