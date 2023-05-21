/*
  Warnings:

  - You are about to alter the column `habitId` on the `FeedItem` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "habitId" INTEGER,
    "text" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_FeedItem" ("createdAt", "habitId", "id", "text", "userId") SELECT "createdAt", "habitId", "id", "text", "userId" FROM "FeedItem";
DROP TABLE "FeedItem";
ALTER TABLE "new_FeedItem" RENAME TO "FeedItem";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
