-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characters" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "frequencyRank" INTEGER NOT NULL,
    "emojiChallenge" TEXT,
    "buildingBlockOnly" BOOLEAN NOT NULL DEFAULT false,
    "hskLevel" TEXT,
    "canonicalWordId" INTEGER,
    CONSTRAINT "Words_canonicalWordId_fkey" FOREIGN KEY ("canonicalWordId") REFERENCES "Words" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Words" ("buildingBlockOnly", "characters", "emojiChallenge", "frequencyRank", "hskLevel", "id", "meaning", "pinyin") SELECT "buildingBlockOnly", "characters", "emojiChallenge", "frequencyRank", "hskLevel", "id", "meaning", "pinyin" FROM "Words";
DROP TABLE "Words";
ALTER TABLE "new_Words" RENAME TO "Words";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
