const { PrismaClient } = require('@prisma/client');

// Instantiate PrismaClient
const prisma = new PrismaClient();

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

  await prisma.habit.update({
    where: {
      id: oldHabit.id
    },
    data: {
      name: req.body.title,
      description: req.body.description,
      logDays: Array.isArray(req.body.logDays) ? req.body.logDays.filter(day => day) : [req.body.logDays].filter(day => day),
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

  // Update user
  const updatedUser = await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      points: totalPoints,
      level,
      remainingPoints
    }
  });

  console.log(`Updated user points for ${updatedUser.id} to ${updatedUser.points}`);
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
      completedAt: completed ? new Date() : null
    }
  });

  // Update user points
  await updateUserPoints(req.user, pointsToAdd);

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
      console.log(`Points to subtract for habit ${habit.id}: ${pointsToSubtract}`);
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


const createFeedItem = async (req, res) => {
  const item = {
    id: Date.now().toString(),
    content: req.body.content,
    type: req.body.type,
    isPublic: req.body.isPublic === 'on',
    userId: req.user.id
  };

  await prisma.feedItem.create({
    data: item
  });

  res.redirect('/');
};

const addFeedItemToFriends = async (req, res) => {
  const friends = await prisma.friend.findMany({
    where: {
      userId: req.user.id
    }
  });

  for (let friend of friends) {
    await prisma.feedItem.create({
      data: {
        id: Date.now().toString(),
        content: req.body.content,
        type: req.body.type,
        isPublic: req.body.isPublic === 'on',
        userId: friend.friendId
      }
    });
  }

  res.redirect('/');
};

const levelingThresholds = Array.from({ length: 20 }, (_, i) => (i * 100 * 1.25) + 100);

module.exports = { addHabit, editHabit, updateHabit, deleteHabit, renderIndex, checkIn, checkMissedHabits, createFeedItem, addFeedItemToFriends, levelingThresholds, updateUserPoints };