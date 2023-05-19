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
    logDays: Array.isArray(req.body.logDays) ? req.body.logDays.filter(day => day) : [req.body.logDays].filter(day => day),
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
  const habit = await prisma.habit.delete({
    where: {
      id: req.params.habitId
    }
  });

  res.redirect('/');
};

const updateUserPoints = async (user, points) => {
  user.points += points;

  let level = 1;
  let remainingPoints = user.points;

  for (let i = 0; i < levelingThresholds.length; i++) {
    if (remainingPoints >= levelingThresholds[i]) {
      level = i + 2;
      remainingPoints -= levelingThresholds[i];
    } else {
      break;
    }
  }

  await prisma.user.update({
    where: {
      id: user.id
    },
    data: {
      level: level,
      remainingPoints: remainingPoints
    }
  });
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

  if (!habit.logDays.includes(new Date().getDay().toString())) {
    return res.redirect('/');
  }

  const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;

  if (lastCheckIn && new Date().getDate() === lastCheckIn.getDate()) {
    return res.redirect('/');
  }

  const newProgress = habit.progress + 1;
  const newStreak = lastCheckIn && new Date().getDate() - lastCheckIn.getDate() === 1 ? habit.streak + 1 : 1;

  await prisma.habit.update({
    where: {
      id: habit.id
    },
    data: {
      progress: newProgress,
      streak: newStreak,
      lastCheckIn: new Date()
    }
  });

  if (newProgress >= habit.duration) {
    await updateUserPoints(req.user, habit.duration * 10);
  }

  res.redirect('/');
};

const checkMissedHabits = async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: {
      userId: req.user.id
    }
  });

  for (let habit of habits) {
    const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;

    if (lastCheckIn && new Date().getDate() - lastCheckIn.getDate() > 1 && habit.logDays.includes(new Date().getDay().toString())) {
      await prisma.habit.update({
        where: {
          id: habit.id
        },
        data: {
          streak: 0
        }
      });
    }
  }

  res.redirect('/');
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