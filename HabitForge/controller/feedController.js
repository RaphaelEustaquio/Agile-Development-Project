const fs = require('fs');
const path = require('path');
let users = require('../data/users.json');


const list = (req, res) => {
    console.log(req.user)
    res.render('feed/index.ejs', { user: req.user });

}

const findAndAddFriend = (req, res) => {
    
}

module.exports = { list,findAndAddFriend };