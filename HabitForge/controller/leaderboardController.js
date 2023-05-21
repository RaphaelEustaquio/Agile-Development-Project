const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const renderPublicLeaderboard = async (req, res) => {
  const sortedUsers = await prisma.user.findMany({
    orderBy: {
      points: 'desc',
    },
  });
  res.render('leaderboard/public.ejs', { user: req.user, leaderboard: sortedUsers });
};

const renderPrivateLeaderboard = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: { realFriends: true },
  });

  const friends = user.realFriends;
  friends.push(user);

  const sortedFriends = friends.sort((a, b) => b.points - a.points);
  res.render('leaderboard/private.ejs', { user: req.user, leaderboard: sortedFriends });
};

module.exports = {
  renderPublicLeaderboard,
  renderPrivateLeaderboard,
};
