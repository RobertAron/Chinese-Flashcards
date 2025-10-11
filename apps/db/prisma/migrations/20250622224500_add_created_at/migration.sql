-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Course" ("ordering", "slug", "title") SELECT "ordering", "slug", "title" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE TABLE "new_Drill" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lessonSlug" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Drill_lessonSlug_fkey" FOREIGN KEY ("lessonSlug") REFERENCES "Lesson" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Drill" ("description", "lessonSlug", "order", "slug", "title") SELECT "description", "lessonSlug", "order", "slug", "title" FROM "Drill";
DROP TABLE "Drill";
ALTER TABLE "new_Drill" RENAME TO "Drill";
CREATE TABLE "new_Lesson" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "courseSlug" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Lesson_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("courseSlug", "ordering", "slug", "title") SELECT "courseSlug", "ordering", "slug", "title" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_Phrases" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "characters" TEXT NOT NULL,
    "pinyin" TEXT NOT NULL,
    "meaning" TEXT NOT NULL,
    "emojiChallenge" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Phrases" ("characters", "emojiChallenge", "id", "meaning", "pinyin") SELECT "characters", "emojiChallenge", "id", "meaning", "pinyin" FROM "Phrases";
DROP TABLE "Phrases";
ALTER TABLE "new_Phrases" RENAME TO "Phrases";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
