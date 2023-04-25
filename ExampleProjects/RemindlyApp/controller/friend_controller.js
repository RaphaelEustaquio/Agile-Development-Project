const { userModel } = require("../database");

const listFriends = (req, res) => {
    const currentUser = req.user;
    if (!currentUser) {
      res.redirect("/login")
    } else {
        const user = userModel.findById(req.user.id);
        const friendData = user.friends.map((friendId) => userModel.findById(friendId));
        res.render("friends/list", { friends: friendData });
    };
};

const searchUser = (req, res) => {
    const currentUser = req.user;
    if (!currentUser) {
      res.redirect("/login")
    } else {
        const query = req.query.q;
        const users = query
        ? userModel.searchUser(query).filter((user) => user.id !== req.user.id)
        : [];
        res.render("friends/search", { users });
    };
};

const addFriend = (req, res) => {
    const currentUser = req.user;
    if (!currentUser) {
      res.redirect("/login")
    } else {
        const friendId = parseInt(req.params.id);
        const user = userModel.findById(req.user.id);
        if (!user.friends.includes(friendId)) {
            user.friends.push(friendId);
        }
        res.redirect("/friends");
    };
};

module.exports = { listFriends, searchUser, addFriend };