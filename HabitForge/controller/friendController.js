const renderFriendsIndex = (req, res) => {
    res.render('friends/index.ejs', { user: req.user });
  };
  
  module.exports = {
    renderFriendsIndex,
  };
  