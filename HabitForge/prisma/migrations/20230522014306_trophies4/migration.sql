/*
  Warnings:

  - You are about to drop the column `userId` on the `Trophy` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "_TrophyToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_TrophyToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Trophy" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_TrophyToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL
);
INSERT INTO "new_Trophy" ("description", "id", "image", "name") SELECT "description", "id", "image", "name" FROM "Trophy";
DROP TABLE "Trophy";
ALTER TABLE "new_Trophy" RENAME TO "Trophy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_TrophyToUser_AB_unique" ON "_TrophyToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_TrophyToUser_B_index" ON "_TrophyToUser"("B");
