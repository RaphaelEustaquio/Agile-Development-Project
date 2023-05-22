/*
  Warnings:

  - You are about to drop the `_TrophyToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "_TrophyToUser";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "UserTrophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trophyId" TEXT NOT NULL,
    "dateObtained" DATETIME NOT NULL,
    CONSTRAINT "UserTrophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTrophy_trophyId_fkey" FOREIGN KEY ("trophyId") REFERENCES "Trophy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
