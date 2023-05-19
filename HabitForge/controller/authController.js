const bcrypt = require('bcryptjs');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const habitController = require('../controller/habitController.js'); 

const renderIndex = async (req, res) => {
  if (req.user) {
    await habitController.checkMissedHabits(req.user);
    await habitController.updateUserPoints(req.user, 0);
  }
  const trees = await prisma.tree.findMany();
  res.render('userhome/index.ejs', { user: req.user, levelingThresholds: habitController.levelingThresholds, trees: trees });
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
      await habitController.checkMissedHabits(user);
      return res.redirect('/');
    });
  })(req, res, next);
};

const renderRegister = (req, res) => {
    res.render('auth/register.ejs');
};

const registerUser = async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await prisma.user.create({
            data: {
                name: req.body.name,
                email: req.body.email,
                password: hashedPassword,
                habits: [],
                friends: [],
                realfriends: [],
                level: 1,
                points: 0,
                remainingPoints: 0,
                feed: [],
                unseen:[],
            },
        });
        res.redirect('/login');
    } catch {
        res.redirect('/register');
    }
};

const logout = (req, res) => {
    req.logout(() => {
        res.redirect('/login');
    });
};

module.exports = { renderIndex, renderLogin, loginUser, renderRegister, registerUser, logout };
