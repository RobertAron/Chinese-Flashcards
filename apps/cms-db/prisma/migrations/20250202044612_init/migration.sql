-- CreateTable
CREATE TABLE "Topic" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Challenge" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "wordsId" INTEGER NOT NULL,
    "topicSlug" TEXT NOT NULL,
    CONSTRAINT "Challenge_topicSlug_fkey" FOREIGN KEY ("topicSlug") REFERENCES "Topic" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characters" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "frequencyRank" INTEGER NOT NULL,
    "emojiChallenge" TEXT
);

-- CreateTable
CREATE TABLE "Phrases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characters" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "emojiChallenge" TEXT
);

-- CreateTable
CREATE TABLE "_ChallengeToWords" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ChallengeToWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChallengeToWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ChallengeToPhrases" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ChallengeToPhrases_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ChallengeToPhrases_B_fkey" FOREIGN KEY ("B") REFERENCES "Phrases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PhrasesToWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PhrasesToWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Phrases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PhrasesToWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Words_characters_key" ON "Words"("characters");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengeToWords_AB_unique" ON "_ChallengeToWords"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengeToWords_B_index" ON "_ChallengeToWords"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ChallengeToPhrases_AB_unique" ON "_ChallengeToPhrases"("A", "B");

-- CreateIndex
CREATE INDEX "_ChallengeToPhrases_B_index" ON "_ChallengeToPhrases"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PhrasesToWords_AB_unique" ON "_PhrasesToWords"("A", "B");

-- CreateIndex
CREATE INDEX "_PhrasesToWords_B_index" ON "_PhrasesToWords"("B");
