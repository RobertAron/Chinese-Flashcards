-- CreateTable
CREATE TABLE "PhraseWords" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "order" INTEGER NOT NULL,
    "phrasesId" INTEGER NOT NULL,
    "wordsId" INTEGER NOT NULL,
    CONSTRAINT "PhraseWords_wordsId_fkey" FOREIGN KEY ("wordsId") REFERENCES "Words" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PhraseWords_phrasesId_fkey" FOREIGN KEY ("phrasesId") REFERENCES "Phrases" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "PhraseWords_phrasesId_order_key" ON "PhraseWords"("phrasesId", "order");
