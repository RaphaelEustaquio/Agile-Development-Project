const trees = require('../data/trees.json');
const trophies = require('../data/trophies.json')
const habitController = require('./habitController.js');

const renderAchievements = (req, res) => {
  res.render('achievements/index.ejs', {user: req.user, trees: trees, levelingThresholds: habitController.levelingThresholds });
}

const renderTrophies = (req, res) => {
  res.render('achievements/trophies.ejs', {user: req.user, trophies: trophies });
}

const renderTrophy = (req, res) => {
  const trophyKey = req.params.key;
  const trophyDesc = trophies[trophyKey];
  const trophyDate =  req.user.trophies.find(trophy => Object.keys(trophy)[0] === trophyKey)[trophyKey];
  res.render('achievements/trophy.ejs', {user: req.user, trophyKey: trophyKey, trophyDesc: trophyDesc, trophyDate: trophyDate });
}


module.exports = { renderAchievements, renderTrophies, renderTrophy };
