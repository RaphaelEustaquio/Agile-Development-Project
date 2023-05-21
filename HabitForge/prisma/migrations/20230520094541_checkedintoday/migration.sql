-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Habit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "logDays" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isPublic" BOOLEAN NOT NULL,
    "progress" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "streak" INTEGER NOT NULL,
    "lastCheckIn" DATETIME,
    "completedAt" DATETIME,
    "checkedInToday" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Habit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Habit" ("completed", "completedAt", "description", "duration", "id", "isPublic", "lastCheckIn", "logDays", "name", "progress", "streak", "userId") SELECT "completed", "completedAt", "description", "duration", "id", "isPublic", "lastCheckIn", "logDays", "name", "progress", "streak", "userId" FROM "Habit";
DROP TABLE "Habit";
ALTER TABLE "new_Habit" RENAME TO "Habit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
