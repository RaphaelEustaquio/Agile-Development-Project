/*
  Warnings:

  - You are about to drop the column `achievedAt` on the `Trophy` table. All the data in the column will be lost.
  - Added the required column `description` to the `Trophy` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `Trophy` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    CONSTRAINT "Trophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Trophy" ("id", "name", "userId") SELECT "id", "name", "userId" FROM "Trophy";
DROP TABLE "Trophy";
ALTER TABLE "new_Trophy" RENAME TO "Trophy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
