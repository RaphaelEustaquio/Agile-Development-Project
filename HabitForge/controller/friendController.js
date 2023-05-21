const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const habitController = require("./habitController");

const renderFriendsIndex = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { realFriends: true, friendRequests: true },
  });

  // Get Tree data for each friend
  const friendTreeData = await Promise.all(
    user.realFriends.map(async friend => {
      const treeData = await prisma.tree.findUnique({ where: { id: friend.level }});
      return {...friend, treeName: treeData.level, treeDesc: treeData.message};
    })
  );

  res.render('friends/index.ejs', { user: user, friends: friendTreeData });
};

const renderAddFriend = (req, res) => {
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null });
};

const renderFriendRequests = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { friendRequests: true },
  });
  
  res.render('friends/friend-requests.ejs', { user: user });
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
        { name: { contains: searchQuery } },
        { name: { not: req.user.name } },
        { realFriends: { none: { name: req.user.name } } },
      ],
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { realFriends: true },
  });

  res.render('friends/add-friend.ejs', { user: user, searchResults: matchedUsers });
};

const followUser = async (req, res) => {
  const userId = req.params.id;
  const userToFollow = await prisma.user.findUnique({ where: { id: userId } });
  if (userToFollow) {
    await prisma.user.update({
      where: { id: userToFollow.id },
      data: {
        friendRequests: {
          create: {
            friendId: req.user.id,
            name: req.user.name,
            email: req.user.email,
            level: req.user.level,
            points: req.user.points,
          },
        },
      },
    });
  }
  res.render('friends/add-friend.ejs', { user: req.user, searchResults: null});
};

const acceptFriend = async (req, res) => {
  const friendRequestId = req.params.id;
  const friendRequest = await prisma.friendRequest.findUnique({
    where: { id: friendRequestId },
  });

  if (friendRequest) {
    const acceptingUser = await prisma.user.findUnique({ where: { id: req.user.id } });
    const requestingUser = await prisma.user.findUnique({ where: { id: friendRequest.friendId } });

    const acceptingUserData = {
      friendId: acceptingUser.id,
      name: acceptingUser.name,
      email: acceptingUser.email,
      level: acceptingUser.level,
      points: acceptingUser.points,
    };

    const requestingUserData = {
      friendId: requestingUser.id,
      name: requestingUser.name,
      email: requestingUser.email,
      level: requestingUser.level,
      points: requestingUser.points,
    };

    await prisma.user.update({
      where: { id: friendRequest.userId },
      data: {
        realFriends: { create: acceptingUserData },
        friendRequests: { delete: { id: friendRequestId } },
      },
    });

    await prisma.user.update({
      where: { id: friendRequest.friendId },
      data: {
        realFriends: { create: requestingUserData },
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
      data: { realFriends: { disconnect: { id: userId } } },
    });
    await prisma.user.update({
      where: { id: userToFollow.id },
      data: { realFriends: { disconnect: { id: req.user.id } } },
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
