const users = require('../data/users.json');
const trees = require('../data/trees.json');
const habitController = require('./habitController.js')

const renderFriendsIndex = (req, res) => {
  res.render('friends/index.ejs', { user: req.user, trees: trees });
};

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null });
};

const renderFriendRequests = (req, res) => {
  res.render('friends/friend-requests.ejs', { user: req.user });
};

const renderFriendHabits = (req, res) => {
  const userId = req.params.id;
  const userToFollow = users.find(user => user.id === userId);
  res.render('friends/friend-habits.ejs', { user: userToFollow,  levelingThresholds: habitController.levelingThresholds, trees: trees });
};


const searchUsers = (req, res) => {
  const searchQuery = req.body.search.toLowerCase();
  if (!searchQuery || searchQuery === " ") {
    return res.render('friends/add-friend.ejs', { user: req.user, searchResults: []});
  }
  const matchedUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery) &&
  user.name !== req.user.name && 
  !req.user.realfriends.some(friend => friend.name === user.name));
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: matchedUsers });
};

const followUser = (req, res) => {
  const userId = req.params.id;
  const userToFollow = users.find(user => user.id === userId);

  if (userToFollow && !req.user.friends.some(friend => friend.id === userId) && !userToFollow.friends.some(friend => friend.id === req.user.id)) {
    userToFollow.friends.push({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      level: req.user.level,
      acceptance: false,
    });
    habitController.saveUsers();
  }  

  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null})
};

const acceptFriend = (req, res) => {
  const userId = req.params.id;
  const userToFollow = users.find(user => user.id === userId);
  userToFollow.realfriends.push({
    id: req.user.id,
    name: req.user.name,
    email:req.user.email,
    level: req.user.level,
    points: req.user.points,
    acceptance: true,
  });

  req.user.realfriends.push({
    id: userToFollow.id,
    name: userToFollow.name,
    email:userToFollow.email,
    level: userToFollow.level,
    points: userToFollow.points,
    acceptance: true,
  });

  req.user.friends = req.user.friends.filter(friend => friend.id !== userId);

  habitController.saveUsers();

  res.redirect('/friends/index');
};

  module.exports = {
    renderFriendsIndex,
    renderAddFriend,
    searchUsers,
    followUser,
    acceptFriend,
    renderFriendRequests,
    renderFriendHabits,
  };
  