const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const renderAchievements = async (req, res) => {
  try {
    const tree = await prisma.tree.findUnique({ where: { id: req.user.level } });
    const levelingThresholds = Array.from({ length: 20 }, (_, i) => (i * 100 * 1.25) + 100);
    res.render('achievements/index.ejs', { user: req.user, tree: tree, levelingThresholds: levelingThresholds });
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
    const trophyId = 'V';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.halfwayThere) {
    const trophyId = 'IV';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.NewUser) {
    const trophyId = 'I';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.firstHabit) {
    const trophyId = 'II';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.firstCheckIn) {
    const trophyId = 'III';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.firstFriend) {
    const trophyId = 'VI';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  } else if (actionData.longTerm) {
    const trophyId = 'VII';
    const existingTrophy = await prisma.userTrophy.findFirst({
      where: {
        userId: user.id,
        trophyId: trophyId,
      },
    });
    if (!existingTrophy) {
      await prisma.userTrophy.create({
        data: {
          userId: user.id,
          trophyId: trophyId,
          dateObtained: new Date(),
        },
      });
    }
  }
  // Add more unlock conditions here
};

module.exports = { renderAchievements, getTrophies, getTrophy, unlockTrophy };
