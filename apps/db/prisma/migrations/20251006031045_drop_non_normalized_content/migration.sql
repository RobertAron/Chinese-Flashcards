/*
  Warnings:

  - You are about to drop the column `characters` on the `Phrases` table. All the data in the column will be lost.
  - You are about to drop the column `emojiChallenge` on the `Phrases` table. All the data in the column will be lost.
  - You are about to drop the column `pinyin` on the `Phrases` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Phrases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "meaning" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Phrases" ("createdAt", "id", "meaning") SELECT "createdAt", "id", "meaning" FROM "Phrases";
DROP TABLE "Phrases";
ALTER TABLE "new_Phrases" RENAME TO "Phrases";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
