const users = require('../data/users.json');
const habitController = require('./habitController.js')

const renderFriendsIndex = (req, res) => {
    res.render('friends/index.ejs', { user: req.user });
  };

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null });
};

const searchUsers = (req, res) => {
  const searchQuery = req.body.search.toLowerCase();
  if (!searchQuery || searchQuery === " ") {
    return res.render('friends/add-friend.ejs', { user: req.user, searchResults: []});
  }
  const matchedUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery) &&
  user.id !== req.user.id && 
  !req.user.friends.some(friend => friend.id === user.id));
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: matchedUsers });
};

const followUser = (req, res) => {
  const userId = req.params.id;
  const userToFollow = users.find(user => user.id === userId);

  if (userToFollow && !req.user.friends.some(friend => friend.id === userId)) {
    req.user.friends.push({
      id: userToFollow.id,
      name: userToFollow.name,
      email: userToFollow.email,
      level: userToFollow.level,
    });
    habitController.saveUsers();
  }

  res.redirect('/friends/index');
};

  module.exports = {
    renderFriendsIndex,
    renderAddFriend,
    searchUsers,
    followUser,
  };
  