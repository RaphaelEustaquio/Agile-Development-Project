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
        progress: 0
    };
    const user = users.find((user) => user.id === req.user.id);

    if (user) {
        user.habits.push(habit);
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
    
    req.user.habits[habitIndex] = {
      id: oldHabit.id,
      name: req.body.title,
      description: req.body.description,
      logDays: Array.isArray(req.body.logDays) ? req.body.logDays.filter(day => day) : [req.body.logDays].filter(day => day),
      duration: parseInt(req.body.duration),
      isPublic: req.body.isPublic === 'on',
      progress: oldHabit.progress,
      checkedInToday: oldHabit.checkedInToday,
      lastCheckIn: oldHabit.lastCheckIn
    };
    saveUsers();
  }
  res.redirect('/');
};
  
 const deleteHabit = (req, res) => {
    const habitIndex = req.user.habits.findIndex((h) => h.id === req.params.habitId);
    
    
    if (habitIndex !== -1){
      const habit = req.user.habits[habitIndex]
      
      req.user.points -= habit.progress;
      
      req.user.habits.splice(habitIndex, 1);
      
      saveUsers();
    }
    res.redirect('/');
};

const levelingThresholds = Array.from({ length: 20 }, (_, i) => (i * 100 * 1.25) + 100);

const updateUserPoints = (user, points) => {
  user.points += points;

  while (user.level < levelingThresholds.length && user.points >= levelingThresholds[user.level - 1]) {
    user.points -= levelingThresholds[user.level - 1];
    user.level++;
  }
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
  updateUserPoints(user, 10);
  habit.checkedInToday = true;
  habit.lastCheckIn = today;

  saveUsers();
  res.redirect('/');
};


const checkMissedHabits = (user) => {
  let pointsDeducted = 0;
  const today = new Date();

  user.habits.forEach((habit) => {
    const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;
    const daysDifference = lastCheckIn ? Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24)) : null;

    if (daysDifference > 0) {
      const missedLogDays = habit.logDays.filter(logDay => {
        const logDayIndex = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(logDay);
        const lastCheckInIndex = lastCheckIn.getDay();
        return (logDayIndex > lastCheckInIndex) || (logDayIndex === lastCheckInIndex && lastCheckIn.getHours() >=  habit.duration);
      });

      if (missedLogDays.length > 0) {
        const habitPoints = habit.progress;
        habit.progress = 0;
        pointsDeducted += habitPoints;
      }
    }
  });

  user.points = Math.max(0, user.points - pointsDeducted);
};

module.exports = { addHabit, editHabit, updateHabit, deleteHabit, checkIn, saveUsers, renderIndex, levelingThresholds, checkMissedHabits, updateUserPoints };
