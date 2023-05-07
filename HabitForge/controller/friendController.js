const renderFriendsIndex = (req, res) => {
    res.render('friends/index.ejs', { user: req.user });
  };

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user });
};

const searchUsers = (req, res) => {
  const searchQuery = req.body.search.toLowerCase();
  const matchedUsers = users.filter(user => user.name.toLowerCase().includes(searchQuery));
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: matchedUsers });
};

  module.exports = {
    renderFriendsIndex,
    renderAddFriend,
    searchUsers,
  };
  