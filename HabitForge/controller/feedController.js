const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const renderFeed = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.user.id
            },
            include: {
                feed: true,
                unseen: true
            }
        });

        if (!user) {
            return res.status(404).send('User not found');
        }

        const unseenItems = user.feed.filter(item => user.unseen.map(u => u.id).includes(item.id));

        const seenItemIds = unseenItems.map(item => item.id);

        // Remove the unseen feed items from user's unseen array
        await prisma.user.update({
            where: { id: user.id },
            data: {
                unseen: {
                    disconnect: seenItemIds.map(id => ({ id }))
                }
            }
        });

        res.render('feed/index.ejs', { user: user, feedItems: unseenItems });

    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
};

module.exports = { renderFeed };
