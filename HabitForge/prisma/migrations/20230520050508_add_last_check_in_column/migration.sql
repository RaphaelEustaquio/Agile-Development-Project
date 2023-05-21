/*
  Warnings:

  - You are about to drop the column `checkedInToday` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Habit" ADD COLUMN "lastCheckIn" DATETIME;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "points" INTEGER NOT NULL DEFAULT 0,
    "remainingPoints" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("email", "id", "level", "name", "password", "points", "remainingPoints") SELECT "email", "id", "level", "name", "password", "points", "remainingPoints" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
