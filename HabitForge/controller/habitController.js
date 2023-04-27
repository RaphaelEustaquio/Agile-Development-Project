const fs = require('fs');
const path = require('path');
const users = require('../data/users.json');
const { checkAuthenticated } = require('../middleware/authMiddleware');

const addHabit = (req, res) => {
    const habit = req.body.habit;
    const user = users.find((user) => user.id === req.user.id);

    if (user) {
        user.habits.push(habit);
        fs.writeFileSync(path.join(__dirname, '..', 'data', 'users.json'), JSON.stringify(users, null, 2));
    }

    res.redirect('/');
};

module.exports = { addHabit };
