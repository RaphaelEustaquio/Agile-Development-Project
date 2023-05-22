const habitController = require('./habitController.js');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const renderAchievements = async (req, res) => {
  try {
    const tree = await prisma.tree.findUnique({ where: { id: req.user.level } });
    res.render('achievements/index.ejs', { user: req.user, tree: tree, levelingThresholds: habitController.levelingThresholds });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading achievements');
  }
};

const getTrophies = async (req, res) => {
  try {
    const trophies = await prisma.trophy.findMany();
    const userTrophies = await prisma.userTrophy.findMany({
      where: { userId: req.user.id },
      select: { trophyId: true },
    });
    const userTrophyIds = userTrophies.map((userTrophy) => userTrophy.trophyId);
    res.render('achievements/trophies.ejs', { userTrophyIds, trophies });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading trophies');
  }
};


const getTrophy = async (req, res) => {
  const trophyId = req.params.id;
  try {
    const trophy = await prisma.trophy.findUnique({ where: { id: trophyId } });
    const userTrophy = await prisma.userTrophy.findFirst({
      where: { userId: req.user.id, trophyId: trophyId },
    });
    const trophyDate = userTrophy ? userTrophy.dateObtained : null;
    res.render('achievements/trophy.ejs', { trophy, trophyDate });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error loading trophy');
  }
};

const unlockTrophy = async (user, actionData) => {
  if (actionData.completedHabitFirstTime) {
    const trophy = await prisma.trophy.findUnique({ where: { name: "Breaking Good"}});
    await prisma.userTrophy.create({
      data: {
        userId: user.id,
        trophyId: trophy.id,
        dateObtained: new Date(),
      },
    });
  } else if (actionData.halfwayCheckIn) {
    const trophy = await prisma.trophy.findUnique({ where: { name: "Halfway There"}});
    await prisma.userTrophy.create({
      data: {
        userId: user.id,
        trophyId: trophy.id,
        dateObtained: new Date(),
      }
    })
  } else if (actionData.NewUser) {
    const trophy = await prisma.trophy.findUnique({ where: { id: "I"}});
    console.log(trophy)
    await prisma.userTrophy.create({
      data: {
        userId: user.id,
        trophyId: trophy.id,
        dateObtained: new Date(),
      }
    })
  } // put more unlock conditions here 
}
module.exports = { renderAchievements, getTrophies, getTrophy, unlockTrophy };
