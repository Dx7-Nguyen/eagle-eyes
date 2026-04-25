/*
  Warnings:

  - You are about to drop the column `fairway` on the `Hole` table. All the data in the column will be lost.
  - You are about to drop the column `gir` on the `Hole` table. All the data in the column will be lost.
  - You are about to drop the column `putts` on the `Hole` table. All the data in the column will be lost.
  - You are about to drop the column `strokes` on the `Hole` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Shot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "holeId" INTEGER NOT NULL,
    "shotNumber" INTEGER NOT NULL,
    "startLie" TEXT NOT NULL,
    "startDistance" REAL NOT NULL,
    "endLie" TEXT NOT NULL,
    "endDistance" REAL NOT NULL,
    CONSTRAINT "Shot_holeId_fkey" FOREIGN KEY ("holeId") REFERENCES "Hole" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Hole" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "number" INTEGER NOT NULL,
    "par" INTEGER NOT NULL,
    "roundId" INTEGER NOT NULL,
    CONSTRAINT "Hole_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "Round" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Hole" ("id", "number", "par", "roundId") SELECT "id", "number", "par", "roundId" FROM "Hole";
DROP TABLE "Hole";
ALTER TABLE "new_Hole" RENAME TO "Hole";
CREATE UNIQUE INDEX "Hole_roundId_number_key" ON "Hole"("roundId", "number");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Shot_holeId_shotNumber_key" ON "Shot"("holeId", "shotNumber");
