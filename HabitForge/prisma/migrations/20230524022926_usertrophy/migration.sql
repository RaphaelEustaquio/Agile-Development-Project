-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserTrophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "trophyId" TEXT NOT NULL,
    "dateObtained" DATETIME NOT NULL,
    "seen" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UserTrophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserTrophy_trophyId_fkey" FOREIGN KEY ("trophyId") REFERENCES "Trophy" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserTrophy" ("dateObtained", "id", "trophyId", "userId") SELECT "dateObtained", "id", "trophyId", "userId" FROM "UserTrophy";
DROP TABLE "UserTrophy";
ALTER TABLE "new_UserTrophy" RENAME TO "UserTrophy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
