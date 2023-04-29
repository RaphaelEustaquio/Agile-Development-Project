const fs = require('fs');
const path = require('path');
const users = require('../data/users.json');
const { checkAuthenticated } = require('../middleware/authMiddleware');

const saveUsers = () => {
    fs.writeFileSync(path.join(__dirname, '../data/users.json'), JSON.stringify(users, null, 2));
  };
  
const addHabit = (req, res) => {
    const habit = {
        id: Date.now().toString(),
        name: req.body.habit,
    };
    const user = users.find((user) => user.id === req.user.id);

    if (user) {
        user.habits.push(habit);
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'users.json'), JSON.stringify(users, null, 2));
    }

    res.redirect('/');
};

const editHabit = (req, res) => {
    const habit = req.user.habits.find((h) => h.id === req.params.habitId);
    if (!habit) {
      return res.redirect('/');
    }
    res.render('edit-habit.ejs', { user: req.user, habit });
};

  const updateHabit = (req, res) => {
    const habitIndex = req.user.habits.findIndex((h) => h.id === req.params.habitId);
    if (habitIndex !== -1) {
      req.user.habits[habitIndex].name = req.body.habit;
      saveUsers();
    }
    res.redirect('/');
};
  
 const deleteHabit = (req, res) => {
    req.user.habits = req.user.habits.filter((h) => h.id !== req.params.habitId);
    saveUsers();
    res.redirect('/');
};
  

module.exports = { addHabit, editHabit, updateHabit, deleteHabit };
