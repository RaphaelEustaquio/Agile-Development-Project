const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const renderFriendsIndex = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { realfriends: true },
  });
  res.render('friends/index.ejs', { user: req.user, friends: user.realfriends, trees: trees });
};

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null });
};

const renderFriendRequests = (req, res) => {
  res.render('friends/friend-requests.ejs', { user: req.user });
};

const renderFriendHabits = async (req, res) => {
  const userId = req.params.id;
  const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
  res.render('friends/friend-habits.ejs', { user: userToFollow,  levelingThresholds: habitController.levelingThresholds, trees: trees });
};

const searchUsers = async (req, res) => {
  const searchQuery = req.body.search.toLowerCase();
  const matchedUsers = await prisma.user.findMany({
    where: {
      AND: [
        { name: { contains: searchQuery, mode: 'insensitive' } },
        { name: { not: req.user.name } },
        { realfriends: { none: { name: req.user.name } } },
      ],
    },
  });
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: matchedUsers });
};

const followUser = async (req, res) => {
  const userId = req.params.id;
  const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
  if (userToFollow) {
    await prisma.user.update({
      where: { id: userToFollow.id },
      data: {
        friends: {
          create: {
            friendId: req.user.id,
            name: req.user.name,
            email: req.user.email,
            level: req.user.level,
            acceptance: false,
          },
        },
      },
    });
  }
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null})
};

const acceptFriend = async (req, res) => {
  const userId = req.params.id;
  const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
  if (userToFollow) {
    const friendData = {
      friendId: req.user.id,
      name: req.user.name,
      email:req.user.email,
      level: req.user.level,
      points: req.user.points,
      acceptance: true,
    };
    await prisma.user.update({
      where: { id: userToFollow.id },
      data: {
        realfriends: { create: friendData },
        friends: { disconnect: { id: req.user.id } },
      },
    });
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        realfriends: { create: friendData },
      },
    });
  }
  res.redirect('/friends/index');
};

const removeFriend = async (req, res) => {
  const userId = req.params.id;
  const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
  if (userToFollow) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { realfriends: { disconnect: { id: userId } } },
    });
    await prisma.user.update({
      where: { id: userToFollow.id },
      data: { realfriends: { disconnect: { id: req.user.id } } },
    });
  }
  res.redirect('/friends/index');
};

module.exports = {
  renderFriendsIndex,
  renderAddFriend,
  searchUsers,
  followUser,
  acceptFriend,
  renderFriendRequests,
  renderFriendHabits,
  removeFriend
};
