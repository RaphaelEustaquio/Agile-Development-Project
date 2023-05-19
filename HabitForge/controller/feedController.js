let users = require('../data/users.json');
const { saveUsers } = require('./habitController.js')

const renderFeed = (req, res) => {
    const user = users.find((user) => user.id === req.user.id);
    // Get all the unseen feed items for the user
    const unseenItems = user.feed.filter(item => user.unseen.includes(item.id));
    // Update the user's unseen array to remove the items that are about to be rendered
    user.unseen = user.unseen.filter(id => !unseenItems.some(item => item.id === id));
    // Save the updated users data
    saveUsers();
    res.render('feed/index.ejs', { user: user, feedItems: unseenItems });
}


module.exports = { renderFeed };