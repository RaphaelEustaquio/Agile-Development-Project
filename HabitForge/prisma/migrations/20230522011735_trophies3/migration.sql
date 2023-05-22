-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trophy" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    CONSTRAINT "Trophy_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trophy" ("description", "id", "image", "name", "userId") SELECT "description", "id", "image", "name", "userId" FROM "Trophy";
DROP TABLE "Trophy";
ALTER TABLE "new_Trophy" RENAME TO "Trophy";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
