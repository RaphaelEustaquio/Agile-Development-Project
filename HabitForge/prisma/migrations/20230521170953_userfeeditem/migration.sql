/*
  Warnings:

  - You are about to drop the `_FeedItemToUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `seen` on the `FeedItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "_FeedItemToUser_B_index";

-- DropIndex
DROP INDEX "_FeedItemToUser_AB_unique";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_FeedItemToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserFeedItem" (
    "userId" TEXT NOT NULL,
    "feedItemId" TEXT NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("userId", "feedItemId"),
    CONSTRAINT "UserFeedItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserFeedItem_feedItemId_fkey" FOREIGN KEY ("feedItemId") REFERENCES "FeedItem" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FeedItem" ("createdAt", "habitId", "id", "text", "userId") SELECT "createdAt", "habitId", "id", "text", "userId" FROM "FeedItem";
DROP TABLE "FeedItem";
ALTER TABLE "new_FeedItem" RENAME TO "FeedItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
