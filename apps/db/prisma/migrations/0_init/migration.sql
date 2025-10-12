-- CreateTable
CREATE TABLE "Course" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Drill" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Drill_lessonSlug_fkey" FOREIGN KEY ("lessonSlug") REFERENCES "Lesson" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Lesson" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "courseSlug" TEXT NOT NULL,
    CONSTRAINT "Lesson_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
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
CREATE TABLE "Words" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characters" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "frequencyRank" INTEGER NOT NULL,
    "emojiChallenge" TEXT
);

-- CreateTable
CREATE TABLE "_DrillToPhrases" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DrillToPhrases_A_fkey" FOREIGN KEY ("A") REFERENCES "Drill" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DrillToPhrases_B_fkey" FOREIGN KEY ("B") REFERENCES "Phrases" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_DrillToWords" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_DrillToWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Drill" ("slug") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_DrillToWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_PhrasesToWords" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_PhrasesToWords_A_fkey" FOREIGN KEY ("A") REFERENCES "Phrases" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PhrasesToWords_B_fkey" FOREIGN KEY ("B") REFERENCES "Words" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "_DrillToPhrases_AB_unique" ON "_DrillToPhrases"("A", "B");

-- CreateIndex
CREATE INDEX "_DrillToPhrases_B_index" ON "_DrillToPhrases"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_DrillToWords_AB_unique" ON "_DrillToWords"("A", "B");

-- CreateIndex
CREATE INDEX "_DrillToWords_B_index" ON "_DrillToWords"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_PhrasesToWords_AB_unique" ON "_PhrasesToWords"("A", "B");

-- CreateIndex
CREATE INDEX "_PhrasesToWords_B_index" ON "_PhrasesToWords"("B");

