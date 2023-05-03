const fs = require('fs');
const path = require('path');
let users = require('../data/users.json');


const list = (req, res) => {
    let friendlist = []
    console.log(req.user)
        // Find reminders of friends and mark them appropriately
    res.render('leaderboard/public.ejs', { user: req.user });
    //     const user = users.findOne(req.user.email)
    //     for (let friend of user.friends) {
    //         const friendUser = Database.findOne(friend)
    //         friendReminders.push({
    //             name: friendUser.name,
    //             email: friendUser.email,
    //             reminderList: friendUser.reminders
    //         })
    //     }

    //     res.render("reminder/index", {reminders: user.reminders, 
    //         friendReminders: friendReminders});
    // res.redirect('/friends')
}

const findAndAddFriend = (req, res) => {
    
}

module.exports = { list,findAndAddFriend };
