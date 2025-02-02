-- CreateTable
CREATE TABLE "TopicCollection" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Topic" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "ordering" INTEGER NOT NULL,
    "topicCollectionSlug" TEXT,
    CONSTRAINT "Topic_topicCollectionSlug_fkey" FOREIGN KEY ("topicCollectionSlug") REFERENCES "TopicCollection" ("slug") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Topic" ("ordering", "slug", "title") SELECT "ordering", "slug", "title" FROM "Topic";
DROP TABLE "Topic";
ALTER TABLE "new_Topic" RENAME TO "Topic";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
