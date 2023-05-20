const habitController = require('./habitController.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const renderAchievements = async (req, res) => {
  try {
    const tree = await prisma.tree.findUnique({ where: { id: req.user.level }});
    res.render('achievements/index.ejs', {user: req.user, tree: tree, levelingThresholds: habitController.levelingThresholds });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading achievements');
  }
}

module.exports = { renderAchievements };
