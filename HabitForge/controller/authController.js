const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const users = require('../data/users.json');
const habitController = require('../controller/habitController.js');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');

const updateHabitsCheckedInToday = (user) => {
    const today = new Date();
    user.habits.forEach((habit) => {
      const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;
      if (lastCheckIn) {
        const daysDifference = Math.floor(
          (today - lastCheckIn) / (1000 * 60 * 60 * 24)
        );
        habit.checkedInToday = daysDifference === 0;
      } else {
        habit.checkedInToday = false;
      }
    });
  };  

const renderIndex = (req, res) => {
  if (req.user) {
    updateHabitsCheckedInToday(req.user);
    habitController.saveUsers();
  }
  res.render('userhome/index.ejs', { user: req.user });
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
        return res.render('auth/login', { errorMessage: info.message });
      }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        // Call updateHabitsCheckedInToday function here
        updateHabitsCheckedInToday(user);
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
            habits: []
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
