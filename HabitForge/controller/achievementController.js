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
  const trophyToUpdate = req.user.trophies.find(trophy => Object.keys(trophy)[0] === trophyKey);
  const trophyToUpdateIndex = req.user.trophies.findIndex(trophy => Object.keys(trophy)[0] === trophyKey);
  console.log(trophyToUpdate)
  console.log(trophyToUpdateIndex)

  if (trophyToUpdate) {
    const trophyDesc = trophies[trophyKey];
    const trophyDate = trophyToUpdate[trophyKey];
  
    res.render('achievements/trophy.ejs', { user: req.user, trophyKey, trophyDesc, trophyDate });
  
    const updatedTrophy = {
      [trophyKey]: trophyDate,
      seen: true
    };
    req.user.trophies[trophyToUpdateIndex] = updatedTrophy;
    habitController.saveUsers();
  }
}


module.exports = { renderAchievements, renderTrophies, renderTrophy };
