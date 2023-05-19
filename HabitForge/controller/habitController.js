const fs = require('fs');
const path = require('path');
let users = require('../data/users.json');


const renderIndex = (req, res) => {
  res.render('userhome/add-habit.ejs', { user: req.user });
}

const saveUsers = () => {
    const updatedUsers = JSON.stringify(users, null, 2);
    fs.writeFileSync(path.join(__dirname, '../data/users.json'), updatedUsers);
    users = JSON.parse(updatedUsers);
  };
  
  
const addHabit = (req, res) => {
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
  };
  const user = users.find((user) => user.id === req.user.id);

  if (user) {
      user.habits.push(habit);
      if (habit.isPublic) {
        let text = `${user.name} has just added "${habit.name}" to their habits. Make sure they stay on track!`;
        createFeedItem(user, habit.id, text);
        addFeedItemToFriends(user, habit.id, text);
      }
      saveUsers();
  }

  res.redirect('/');
};


const editHabit = (req, res) => {
    const habit = req.user.habits.find((h) => h.id === req.params.habitId);
    if (!habit) {
      return res.redirect('/');
    }
    res.render('userhome/edit-habit.ejs', { user: req.user, habit });
};

const updateHabit = (req, res) => {
  const habitIndex = req.user.habits.findIndex((h) => h.id === req.params.habitId);
  if (habitIndex !== -1) {
    const oldHabit = req.user.habits[habitIndex];
    const parsedDuration = parseInt(req.body.duration);
    const duration = parsedDuration < oldHabit.streak ? oldHabit.streak : parsedDuration;
    let completed = false;

    if (oldHabit.streak === duration) {
      updateUserPoints(req.user, duration * 10);
      completed = true;
    }

    req.user.habits[habitIndex] = {
      id: oldHabit.id,
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
    };
    saveUsers();
  }
  res.redirect('/');
};
  
const deleteHabit = (req, res) => {
  const habitIndex = req.user.habits.findIndex((h) => h.id === req.params.habitId);
  
  if (habitIndex !== -1){
    const habit = req.user.habits[habitIndex];
    
    req.user.points -= habit.progress;
    if (habit.isPublic) {
      let text = `${req.user.name} has just removed ${habit.name} from their habits.`;
      createFeedItem(req.user, habit.id, text);
      addFeedItemToFriends(req.user, habit.id, text);
    }
    req.user.habits.splice(habitIndex, 1);
    
    saveUsers();
  }
  res.redirect('/');
};

const levelingThresholds = Array.from({ length: 20 }, (_, i) => (i * 100 * 1.25) + 100);

const updateUserPoints = (user, points) => {
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

  user.level = level;
  user.remainingPoints = remainingPoints;
};

const checkIn = (req, res) => {
  const habitId = req.params.habitId;
  const user = users.find((user) => user.id === req.user.id);
  const habit = user.habits.find((habit) => habit.id === habitId);

  if (!habit) {
    return res.redirect("/");
  }

  const today = new Date();

  habit.progress += 10;
  habit.streak += 1;
  habit.checkedInToday = true;
  habit.lastCheckIn = today;
  if (habit.isPublic) {
    let text = `${user.name} successfully checked in their habit: ${habit.name}. They are on day ${habit.streak}/${habit.duration}.`;
    createFeedItem(user, habit.id, text);
    addFeedItemToFriends(user, habit.id, text);
  }

  updateUserPoints(user, habit.progress); // add habit progress points to user points
  // Check if the habit duration is reached
  if (habit.streak === habit.duration) {
    let bonus = habit.duration * 10
    updateUserPoints(user, bonus);
    habit.completed = true; // mark the habit as completed
  }

  saveUsers();
  res.redirect('/');
};

const checkMissedHabits = (user) => {
  let pointsDeducted = 0;
  const today = new Date();

  user.habits.forEach((habit) => {
    if (habit.completed) {
      // This habit is already completed, so we don't need to check for missed check-ins
      return;
    }

    const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;
    const daysDifference = lastCheckIn ? Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24)) : null;

    if (daysDifference > 0) {
      const missedLogDays = habit.logDays.filter(logDay => {
        const logDayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(logDay);
        const lastCheckInIndex = lastCheckIn.getDay();
        return (logDayIndex > lastCheckInIndex) || (logDayIndex === lastCheckInIndex && lastCheckIn.getHours() >=  habit.duration);
      });

      if (missedLogDays.length > 0) {
        // Reset the streak and progress
        habit.streak = 0;
        const habitPoints = habit.progress;
        habit.progress = 0;
        pointsDeducted += habitPoints;
        habit.checkedInToday = false;
        if (habit.isPublic) {
          let text = `${user.name} missed their check-in day for ${habit.name}. Help motivate them to get back on track!`;
          createFeedItem(user, habit.id, text);
          addFeedItemToFriends(user, habit.id, text);
      }
    }
  }
  });

  user.points = Math.max(0, user.points - pointsDeducted);
};

const createFeedItem = (user, habitId, text) => {
  const feedItem = {
    id: Date.now().toString(),
    userId: user.id,
    habitId: habitId,
    text: text,
    date: new Date()
  };

  // Initialize unseen array if it does not exist
  if (!user.unseen) {
    user.unseen = [];
  }

  // Check if this message already exists in the user's feed
  if (!user.feed.some(item => item.text === text && item.habitId === habitId)) {
    user.feed.push(feedItem);
    // Also add this item to the user's unseen feed items
    user.unseen.push(feedItem.id);
  }

  return feedItem;  // return the feedItem
};

const addFeedItemToFriends = (user, habitId, text) => {
  user.realfriends.forEach(friend => {
    const friendUser = users.find(u => u.id === friend.id);
    if (friendUser) {
      // Initialize unseen array if it does not exist
      if (!friendUser.unseen) {
        friendUser.unseen = [];
      }

      // Only create a feed item if it doesn't already exist in the friend's feed
      if (!friendUser.feed.some(item => item.text === text && item.habitId === habitId)) {
        const feedItem = createFeedItem(friendUser, habitId, text); // store the returned feedItem
        // Also add this item to the friend's unseen feed items
        friendUser.unseen.push(feedItem.id);
      }
    }
  });
};

module.exports = { addHabit, editHabit, updateHabit, deleteHabit, checkIn, saveUsers, renderIndex, levelingThresholds, checkMissedHabits, updateUserPoints };
