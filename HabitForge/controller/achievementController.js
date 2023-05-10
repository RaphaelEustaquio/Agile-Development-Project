const fs = require('fs');
const path = require('path');
let users = require('../data/users.json');


const renderAchievements = (req, res) => {
    res.render('achievements/index.ejs', { user: req.user });
}

module.exports = { renderAchievements };