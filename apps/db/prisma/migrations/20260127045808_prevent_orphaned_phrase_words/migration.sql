-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PhraseWords" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "phrasesId" INTEGER NOT NULL,
    "wordsId" INTEGER NOT NULL,
    CONSTRAINT "PhraseWords_wordsId_fkey" FOREIGN KEY ("wordsId") REFERENCES "Words" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PhraseWords_phrasesId_fkey" FOREIGN KEY ("phrasesId") REFERENCES "Phrases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PhraseWords" ("id", "order", "phrasesId", "wordsId") SELECT "id", "order", "phrasesId", "wordsId" FROM "PhraseWords";
DROP TABLE "PhraseWords";
ALTER TABLE "new_PhraseWords" RENAME TO "PhraseWords";
CREATE UNIQUE INDEX "PhraseWords_phrasesId_order_key" ON "PhraseWords"("phrasesId", "order");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
