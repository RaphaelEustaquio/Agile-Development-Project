let users = require('../data/users.json');

const renderFeed = (req, res) => {
    const user = users.find((user) => user.id === req.user.id);
    res.render('feed/index.ejs', { user: user });
}


module.exports = { renderFeed };