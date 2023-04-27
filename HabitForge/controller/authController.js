const bcrypt = require('bcryptjs');
const passport = require('passport');
const fs = require('fs');
const path = require('path');
const users = require('../data/users.json');
const { checkAuthenticated, checkNotAuthenticated } = require('../middleware/authMiddleware');

const renderIndex = (req, res) => {
    res.render('index.ejs', { user: req.user });
};

const renderLogin = (req, res) => {
    res.render('login.ejs');
};

const loginUser = passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
});

const renderRegister = (req, res) => {
    res.render('register.ejs');
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
    req.logout();
    res.redirect('/login');
};

module.exports = { renderIndex, renderLogin, loginUser, renderRegister, registerUser, logout };
