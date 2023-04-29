const express = require('express');
const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const initializePassport = require('./middleware/passport');
const authController = require('./controller/authController');
const habitController = require('./controller/habitController');
const path = require("path")
const { checkAuthenticated, checkNotAuthenticated } = require('./middleware/authMiddleware');

const app = express();
const users = require('./data/users.json');
const getUserByEmail = (email) => users.find((user) => user.email === email);
const getUserById = (id) => users.find((user) => user.id === id);

initializePassport(passport, getUserByEmail, getUserById);

app.use(express.static(path.join(__dirname, "public")));
app.set('view-engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
    store: new FileStore(),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.get('/', checkAuthenticated, authController.renderIndex);
app.get('/login', checkNotAuthenticated, authController.renderLogin);
app.post('/login', checkNotAuthenticated, authController.loginUser);
app.get('/register', checkNotAuthenticated, authController.renderRegister);
app.post('/register', checkNotAuthenticated, authController.registerUser);
app.post('/add-habit', checkAuthenticated, habitController.addHabit);
app.get('/userhome/edit-habit/:habitId', checkAuthenticated, habitController.editHabit);
app.post('/userhome/update-habit/:habitId', checkAuthenticated, habitController.updateHabit);
app.post('/delete-habit/:habitId', checkAuthenticated, habitController.deleteHabit);
app.get('/logout', authController.logout);

app.listen(3000, () => {
    console.log('Server running. Visit: localhost:3000/login in your browser');
});
