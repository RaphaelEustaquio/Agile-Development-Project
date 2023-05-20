const express = require('express');
const passport = require('passport');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const initializePassport = require('./middleware/passport');
const path = require("path")
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const friendRoutes = require('./routes/friendRoutes')
const feedRoutes = require('./routes/feedRoutes')
const leaderboardRoutes = require('./routes/leaderboardRoutes')
const achievementRoutes = require('./routes/achievementRoutes')
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();

const getUserByEmail = async (email) => await prisma.user.findUnique({ where: { email } });
const getUserById = async (id) => await prisma.user.findUnique({ where: { id } });

initializePassport(passport, getUserByEmail, getUserById);

app.use(express.static(path.join(__dirname, "public")));
app.set('view-engine', 'ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    store: new FileStore(),
    secret: 'secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(authRoutes);
app.use(habitRoutes);
app.use(friendRoutes); 
app.use(feedRoutes); 
app.use(leaderboardRoutes); 
app.use(achievementRoutes);

module.exports = app;

if(process.env.NODE_ENV !== 'test') {
    app.listen(3000, () => {
        console.log('Server running. Visit: localhost:3000/login in your browser');
    });
}
