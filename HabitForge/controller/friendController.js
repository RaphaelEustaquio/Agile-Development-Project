const renderFriendsIndex = (req, res) => {
    res.render('friends/index.ejs', { user: req.user });
  };

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user });
};

  module.exports = {
    renderFriendsIndex,
    renderAddFriend,
  };
  