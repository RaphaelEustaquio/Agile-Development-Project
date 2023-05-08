const users = require('../data/users.json');

const comparePoints = (a, b) => {
  return b.points - a.points;
};

const renderPublicLeaderboard = (req, res) => {
  const sortedUsers = users.slice().sort(comparePoints);
  res.render('leaderboard/public.ejs', { user: req.user, leaderboard: sortedUsers });
};

const renderPrivateLeaderboard = (req, res) => {
  const friends = req.user.friends;
  friends.push(req.user);
  const sortedFriends = friends.slice().sort(comparePoints);
  res.render('leaderboard/private.ejs', { user: req.user, leaderboard: sortedFriends });
};

module.exports = {
  renderPublicLeaderboard,
  renderPrivateLeaderboard,
};
