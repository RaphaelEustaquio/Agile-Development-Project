const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const habitController = require('../controller/habitController.js');
const { unlockTrophy } = require('./achievementController.js');

const renderIndex = async (req, res) => {
  if (req.user) {
    await habitController.checkMissedHabits(req.user); // first check and update missed habits
    const user = await prisma.user.findUnique({ // then get the user with the updated points value
      where: { 
        id: req.user.id 
      },
      include: {
        habits: true,
        userTrophies: true,
      }
    });
    const tree = await prisma.tree.findUnique({ where: { id: req.user.level }});
    res.render('userhome/index.ejs', { user, levelingThresholds: habitController.levelingThresholds, tree: tree });
  }
  else {
    const tree = await prisma.tree.findUnique({ where: { id: req.user.level }});
    res.render('userhome/index.ejs', { user: req.user, levelingThresholds: habitController.levelingThresholds, tree: tree });
  }
};


const renderLogin = (req, res) => {
    res.render('auth/login.ejs');
};

const loginUser = (req, res, next) => {
  passport.authenticate('local', async (err, user, info) => {
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
      if (req.user) {
        await habitController.checkMissedHabits(req.user);
      }
      await renderIndex(req, res); // Call the renderIndex function instead of directly redirecting
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
    await unlockTrophy(newUser, { NewUser: true });
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
