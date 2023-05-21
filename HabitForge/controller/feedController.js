const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const renderFeed = async (req, res) => {
    // Find unseen feed items
    const unseenUserFeedItems = await prisma.userFeedItem.findMany({
        where: {
            userId: req.user.id,
            seen: false
        },
        include: {
            feedItem: true // Include associated feed item
        },
        orderBy: {
            feedItem: {
                createdAt: 'desc'
            }
        }
    });

    // Convert feed items to format expected by the view
    const feedItems = unseenUserFeedItems.map((userFeedItem) => {
        const item = userFeedItem.feedItem;
        item.date = item.createdAt.toDateString();
        return item;
    });

    // Update status of displayed items to seen
    for (let userFeedItem of unseenUserFeedItems) {
        await prisma.userFeedItem.update({
            where: {
                userId_feedItemId: {
                    userId: req.user.id,
                    feedItemId: userFeedItem.feedItemId
                }
            },
            data: {
                seen: true
            }
        });
    }

    res.render('feed/index.ejs', { user: req.user, feedItems: feedItems });
};

module.exports = { renderFeed };
