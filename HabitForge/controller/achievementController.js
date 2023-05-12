const trees = require('../data/trees.json');
const habitController = require('./habitController.js');

const renderAchievements = (req, res) => {
  res.render('achievements/index.ejs', {user: req.user, trees: trees, levelingThresholds: habitController.levelingThresholds });
}

module.exports = { renderAchievements };
