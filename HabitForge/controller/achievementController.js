const trees = require('../data/trees.json');

const renderAchievements = (req, res) => {
  res.render('achievements/index.ejs', {user: req.user, trees: trees});
}

module.exports = { renderAchievements };
