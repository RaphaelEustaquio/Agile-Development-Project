const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const habitController = require("./habitController");
const { unlockTrophy } = require("./achievementController");

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
  if (!req.user) {
    return res.redirect('/login');
  }

  const userId = req.params.id;
  const userToFollow = await prisma.RealFriend.findUnique({ where: { id: userId } });
  const friend = await prisma.user.findUnique({ where: { id: userToFollow.friendId}, include: {
    habits: true,
   } });

  if (!friend) {
    return res.redirect('/friends/index');
  }

  const tree = await prisma.tree.findUnique({ where: { id: friend.level }});

  res.render('friends/friend-habits.ejs', {
    user: friend,
    levelingThresholds: habitController.levelingThresholds,
    tree: tree,
  });
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
        realFriends: { create: requestingUserData },
        friendRequests: { delete: { id: friendRequestId } },
      },
    });

    await prisma.user.update({
      where: { id: friendRequest.friendId },
      data: {
        realFriends: { create: acceptingUserData },
      },
    });

    await unlockTrophy(acceptingUser, { firstFriend: true });
    await unlockTrophy(requestingUser, { firstFriend: true });
  }

  res.redirect('/friends/index');
};

const removeFriend = async (req, res) => {
  const friendId = req.params.id;
  const userId = req.user.id;

  const friend = await prisma.user.findUnique({ where: { id: friendId }, include: {realFriends: true }});
  const user = await prisma.user.findUnique({ where: { id: userId }, include: {realFriends: true }});

  const matchingFriend = user.realFriends.find(
    (realFriend) => realFriend.friendId === friendId
  )
  const matchingUser = friend.realFriends.find(
    (realFriend) => realFriend.friendId === userId
  )
  if (matchingFriend) {
    await prisma.realFriend.delete({
      where: { id: matchingFriend.id}
    })
  }

  if (matchingUser) {
    await prisma.realFriend.delete({
      where: { id: matchingUser.id }
    })
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
