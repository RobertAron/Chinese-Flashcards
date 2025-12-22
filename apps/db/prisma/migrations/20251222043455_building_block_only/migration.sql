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
    "hskLevel" TEXT
);
INSERT INTO "new_Words" ("characters", "emojiChallenge", "frequencyRank", "hskLevel", "id", "meaning", "pinyin") SELECT "characters", "emojiChallenge", "frequencyRank", "hskLevel", "id", "meaning", "pinyin" FROM "Words";
DROP TABLE "Words";
ALTER TABLE "new_Words" RENAME TO "Words";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
