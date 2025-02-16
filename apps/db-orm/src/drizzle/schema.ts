import {
  sqliteTable,
  text,
  numeric,
  integer,
} from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const prismaMigrations = sqliteTable("_prisma_migrations", {
  id: text("id").primaryKey().notNull(),
  checksum: text("checksum").notNull(),
  finishedAt: numeric("finished_at"),
  migrationName: text("migration_name").notNull(),
  logs: text("logs"),
  rolledBackAt: numeric("rolled_back_at"),
  startedAt: numeric("started_at")
    .default(sql`(current_timestamp)`)
    .notNull(),
  appliedStepsCount: numeric("applied_steps_count").notNull(),
});

export const words = sqliteTable("Words", {
  id: integer("id").primaryKey().notNull(),
  characters: text("characters").notNull(),
  pinyin: text("pinyin").notNull(),
  meaning: text("meaning").notNull(),
  frequencyRank: integer("frequencyRank").notNull(),
  emojiChallenge: text("emojiChallenge"),
});

export const phrases = sqliteTable("Phrases", {
  id: integer("id").primaryKey().notNull(),
  characters: text("characters").notNull(),
  pinyin: text("pinyin").notNull(),
  meaning: text("meaning").notNull(),
  emojiChallenge: text("emojiChallenge"),
});

export const drillToWords = sqliteTable("_DrillToWords", {
  a: text("A")
    .notNull()
    .references(() => drill.slug, { onDelete: "cascade", onUpdate: "cascade" }),
  b: integer("B")
    .notNull()
    .references(() => words.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const drillToPhrases = sqliteTable("_DrillToPhrases", {
  a: text("A")
    .notNull()
    .references(() => drill.slug, { onDelete: "cascade", onUpdate: "cascade" }),
  b: integer("B")
    .notNull()
    .references(() => phrases.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const phrasesToWords = sqliteTable("_PhrasesToWords", {
  a: integer("A")
    .notNull()
    .references(() => phrases.id, { onDelete: "cascade", onUpdate: "cascade" }),
  b: integer("B")
    .notNull()
    .references(() => words.id, { onDelete: "cascade", onUpdate: "cascade" }),
});

export const drill = sqliteTable("Drill", {
  slug: text("slug").primaryKey().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  lessonSlug: text("lessonSlug")
    .notNull()
    .references(() => lesson.slug, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  order: integer("order").default(0).notNull(),
});

export const course = sqliteTable("Course", {
  slug: text("slug").primaryKey().notNull(),
  title: text("title").notNull(),
  ordering: integer("ordering").notNull(),
});

export const lesson = sqliteTable("Lesson", {
  slug: text("slug").primaryKey().notNull(),
  title: text("title").notNull(),
  ordering: integer("ordering").notNull(),
  courseSlug: text("courseSlug")
    .notNull()
    .references(() => course.slug, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
});