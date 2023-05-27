const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { unlockTrophy } = require('./achievementController')

const renderIndex = (req, res) => {
  res.render('userhome/add-habit.ejs', { user: req.user });
}

const addHabit = async (req, res) => {
  const habit = {
    id: Date.now().toString(),
    name: req.body.title,
    description: req.body.description,
    logDays: Array.isArray(req.body.logDays) ? req.body.logDays.join(',') : req.body.logDays,
    duration: parseInt(req.body.duration),
    isPublic: req.body.isPublic === 'on',
    progress: 0,
    completed: false,
    streak: 0,
    userId: req.user.id
  };

  await prisma.habit.create({
    data: habit
  });

  await unlockTrophy(req.user, { firstHabit: true });

  if (habit.isPublic) {
    // Refresh user data from the database before calling `createFeedItemForUserAndFriends`
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    await createFeedItemForUserAndFriends(user, habit.id, `${req.user.name} just added ${habit.name} to their habits! Wish them the best!`);
  }

  res.redirect('/');
};

const editHabit = async (req, res) => {
  const habit = await prisma.habit.findUnique({
    where: {
      id: req.params.habitId
    }
  });

  if (!habit) {
    return res.redirect('/');
  }

  res.render('userhome/edit-habit.ejs', { user: req.user, habit });
};

// used to update the habit when editing the habit
const updateHabit = async (req, res) => {
  const oldHabit = await prisma.habit.findUnique({
    where: {
      id: req.params.habitId
    }
  });

  if (!oldHabit) {
    return res.redirect('/');
  }

  const parsedDuration = parseInt(req.body.duration);
  const duration = parsedDuration < oldHabit.streak ? oldHabit.streak : parsedDuration;
  let completed = false;

  if (oldHabit.streak === duration) {
    updateUserPoints(req.user, duration * 10);
    completed = true;
  }

  let logDays = oldHabit.logDays;
  if (Array.isArray(req.body.logDays)) {
    logDays = req.body.logDays.filter(day => day).join(',');
  }

  await prisma.habit.update({
    where: {
      id: oldHabit.id
    },
    data: {
      name: req.body.title,
      description: req.body.description,
      logDays: logDays,
      duration: duration,
      isPublic: req.body.isPublic === 'on',
      progress: oldHabit.progress,
      checkedInToday: oldHabit.checkedInToday,
      lastCheckIn: oldHabit.lastCheckIn,
      streak: oldHabit.streak,
      completed: completed
    }
  });

  res.redirect('/');
};

const deleteHabit = async (req, res) => {
  const habit = await prisma.habit.findUnique({
    where: {
      id: req.params.habitId
    }
  });

  if (!habit) {
    return res.redirect('/');
  }

  // Subtract points equal to habit progress only if the habit is not completed
  if (!habit.completed) {
    const pointsToRemove = habit.progress * 10;  // You can adjust this as needed
    await updateUserPoints(req.user, -pointsToRemove);
  }

  await prisma.habit.delete({
    where: {
      id: req.params.habitId
    }
  });

  if (habit.isPublic) {
    // Refresh user data from the database before calling `createFeedItemForUserAndFriends`
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    await createFeedItemForUserAndFriends(user, habit.id, `${req.user.name} just deleted ${habit.name} from their habits!`);
  }

  res.redirect('/');
};

const updateUserPoints = async (user, points) => {
  // Calculate total points
  let totalPoints = user.points + points;

  // Don't let points fall below zero
  if (totalPoints < 0) {
    totalPoints = 0;
  }

  // Calculate level and remaining points
  let level = 1;
  let remainingPoints = totalPoints;
  for (let i = 0; i < levelingThresholds.length; i++) {
    if (remainingPoints >= levelingThresholds[i]) {
      level = i + 2;
      remainingPoints -= levelingThresholds[i];
    } else {
      break;
    }
  }

  let levelUp = false;
  if (level > user.level) {
    levelUp = true;
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      points: Number.isNaN(totalPoints) ? 0 : Math.floor(totalPoints),
      level,
      remainingPoints: Number.isNaN(remainingPoints) ? 0 : Math.floor(remainingPoints),
      levelUp,
    },
  });
};

const checkLevelUpAndCreateFeedItem = async (user) => {
  const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });
  
  if(updatedUser.levelUp) {
    await createFeedItemForUserAndFriends(updatedUser, null, `${updatedUser.name} has leveled up by maintaining their habits! Congrats!`);
    // reset levelUp flag to false
    await prisma.user.update({ where: { id: updatedUser.id }, data: { levelUp: false } });
  }
};

const checkIn = async (req, res) => {
  const habit = await prisma.habit.findUnique({
    where: {
      id: req.params.habitId
    }
  });

  if (!habit) {
    return res.redirect('/');
  }

  if (!habit.logDays.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))) {
    return res.redirect('/');
  } 

  const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;

  if (lastCheckIn && new Date().getDate() === lastCheckIn.getDate()) {
    return res.redirect('/');
  }

  const newProgress = habit.progress + 1;
  const newStreak = lastCheckIn && new Date().getDate() - lastCheckIn.getDate() === 1 ? habit.streak + 1 : 1;

  // Calculate points based on progress and duration
  let pointsToAdd = newProgress * 10;
  let completed = false;
  if (newProgress >= habit.duration) {
    pointsToAdd += habit.duration * 5;
    completed = true;
  }

  if (newProgress === Math.floor(habit.duration / 2)) {
    await unlockTrophy(req.user, { halfwayThere: true });
  }

  if (newProgress >= 30 && completed === true) {
    await unlockTrophy(req.user, { longTerm: true });
  }

  if (completed === true) {
    await unlockTrophy(req.user, { completedHabitFirstTime: true });
  }

  // Update habit
  await prisma.habit.update({
    where: {
      id: habit.id
    },
    data: {
      progress: newProgress,
      streak: newStreak,
      lastCheckIn: new Date(),
      completed,
      completedAt: completed ? new Date() : null,
      checkedInToday: true
    }
  });

  // Update user points
  await updateUserPoints(req.user, pointsToAdd);
  await checkLevelUpAndCreateFeedItem(req.user);

  // If the habit is public, create a feed item for the check-in
  if (habit.isPublic) {
    // Refresh user data from the database before calling `createFeedItemForUserAndFriends`
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
    });
    await createFeedItemForUserAndFriends(req.user, habit.id, `${req.user.name} just checked in to their habit ${habit.name}!`);
  }

  await unlockTrophy(req.user, { firstCheckIn: true });

  res.redirect('/');
};

const checkMissedHabits = async (user) => {
  const habits = await prisma.habit.findMany({
    where: {
      userId: user.id,
      completed: false
    }
  });

  for (let habit of habits) {
    const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;

    if (lastCheckIn && new Date().getDate() - lastCheckIn.getDate() > 1 && habit.logDays.includes(new Date().toLocaleDateString('en-US', { weekday: 'long' }))) {
      // calculate the points to subtract based on the habit's progress
      const pointsToSubtract = habit.progress * 10;
      if (habit.isPublic) {
        await createFeedItemForUserAndFriends(user, habit.id, `${user.name} missed a check-in for their habit ${habit.name}. Encourage them to get back on track!`);
      }
      // update the user's points first
      await updateUserPoints(user, -pointsToSubtract);
      
      // then reset the habit's streak and progress
      await prisma.habit.update({
        where: {
          id: habit.id
        },
        data: {
          streak: 0,
          progress: 0
        }
      });

    }
  }
};

const createFeedItemForUserAndFriends = async (user, habitId, text) => {
  const feedItem = await prisma.feedItem.create({
    data: {
      userId: user.id,
      habitId: habitId,
      text: text,
      createdAt: new Date(),
    }
  });

  // Create a UserFeedItem for the user
  await prisma.userFeedItem.create({
    data: {
      userId: user.id,
      feedItemId: feedItem.id,
    }
  });

  // Add the feed item to each friend's feedItems
  const friends = await prisma.realFriend.findMany({ where: { userId: user.id }});

  for (let friend of friends) {
    await prisma.userFeedItem.create({
      data: {
        userId: friend.friendId,
        feedItemId: feedItem.id,
      }
    });
  }
};

const levelingThresholds = Array.from({ length: 20 }, (_, i) => (i * 100 * 1.25) + 100);

module.exports = { addHabit, editHabit, updateHabit, deleteHabit, renderIndex, checkIn, checkMissedHabits, levelingThresholds, updateUserPoints };