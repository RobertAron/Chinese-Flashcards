/*
  Warnings:

  - Made the column `courseSlug` on table `Lesson` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lesson" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "courseSlug" TEXT NOT NULL,
    CONSTRAINT "Lesson_courseSlug_fkey" FOREIGN KEY ("courseSlug") REFERENCES "Course" ("slug") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("courseSlug", "ordering", "slug", "title") SELECT "courseSlug", "ordering", "slug", "title" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- RedefineIndex
DROP INDEX "_ChallengeToPhrases_B_index";
CREATE INDEX "_DrillToPhrases_B_index" ON "_DrillToPhrases"("B");

-- RedefineIndex
DROP INDEX "_ChallengeToPhrases_AB_unique";
CREATE UNIQUE INDEX "_DrillToPhrases_AB_unique" ON "_DrillToPhrases"("A", "B");

-- RedefineIndex
DROP INDEX "_ChallengeToWords_B_index";
CREATE INDEX "_DrillToWords_B_index" ON "_DrillToWords"("B");

-- RedefineIndex
DROP INDEX "_ChallengeToWords_AB_unique";
CREATE UNIQUE INDEX "_DrillToWords_AB_unique" ON "_DrillToWords"("A", "B");
