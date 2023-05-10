const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const users = require('../data/users.json');
const trees = require('../data/trees.json');
const habitController = require('../controller/habitController.js'); 

const renderIndex = (req, res) => {
  if (req.user) {
    habitController.checkMissedHabits(req.user);
    habitController.updateUserPoints(req.user, 0);
    habitController.saveUsers();
  }
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
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        habitController.checkMissedHabits(user);
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
        const newUser = {
            id: Date.now().toString(),
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            habits: [],
            friends: [],
            realfriends: [],
            level: 1,
            points: 0,
            totalPoints: 0,
        };
        users.push(newUser);
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'users.json'), JSON.stringify(users, null, 2));
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
