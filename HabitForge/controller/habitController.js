const fs = require('fs');
const path = require('path');
let users = require('../data/users.json');
const { checkAuthenticated } = require('../middleware/authMiddleware');

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
      req.user.habits[habitIndex] = {
        id: req.user.habits[habitIndex].id,
        name: req.body.habit,
      };
      saveUsers();
    }
    res.redirect('/');
  };
  
  
 const deleteHabit = (req, res) => {
    req.user.habits = req.user.habits.filter((h) => h.id !== req.params.habitId);
    saveUsers();
    res.redirect('/');
};

const checkIn = (req, res) => {
  const habitId = req.params.habitId;
  const user = users.find((user) => user.id === req.user.id);
  const habit = user.habits.find((habit) => habit.id === habitId);

  if (!habit) {
    return res.redirect("/");
  }

  const today = new Date();
  const lastCheckIn = habit.lastCheckIn ? new Date(habit.lastCheckIn) : null;
  const daysDifference = lastCheckIn ? Math.floor((today - lastCheckIn) / (1000 * 60 * 60 * 24)) : null;
  
  if (daysDifference > 1) {
    user.points -= habit.progress;
    habit.progress = 0;
  }

  habit.progress += 10;
  user.points += 10;
  habit.checkedInToday = true;

  const nextLevelPoints = user.level * 100 * 1.25;
  if (user.points >= nextLevelPoints) {
    user.level++;
    user.points -= nextLevelPoints;
  }

  habit.lastCheckIn = today;

  saveUsers();
  res.redirect('/');
};

module.exports = { addHabit, editHabit, updateHabit, deleteHabit, checkIn };
