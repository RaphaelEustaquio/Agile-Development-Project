const users = require('../data/users.json');

const comparePoints = (a, b) => {
  return b.totalPoints - a.totalPoints;
};

const renderPublicLeaderboard = (req, res) => {
  const sortedUsers = users.slice().sort(comparePoints);
  res.render('leaderboard/public.ejs', { user: req.user, leaderboard: sortedUsers });
};

const renderPrivateLeaderboard = (req, res) => {
  const friends = [];
  req.user.realfriends.forEach(friend => {
    const userToFollow = users.find(user => user.id === friend.id);
    if (userToFollow) {
      friends.push({
        id: userToFollow.id,
        name: userToFollow.name,
        email: userToFollow.email,
        level: userToFollow.level,
        totalPoints: userToFollow.totalPoints
      });
    }
  });
  friends.push(req.user);
  const sortedFriends = friends.slice().sort(comparePoints);
  res.render('leaderboard/private.ejs', { user: req.user, leaderboard: sortedFriends });
};

module.exports = {
  renderPublicLeaderboard,
  renderPrivateLeaderboard,
};
