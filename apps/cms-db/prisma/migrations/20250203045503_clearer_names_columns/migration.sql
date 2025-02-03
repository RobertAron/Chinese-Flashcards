ALTER TABLE Lesson
RENAME COLUMN "topicCollectionSlug" TO courseSlug;
ALTER TABLE Drill
RENAME COLUMN "topicSlug" TO lessonSlug;
