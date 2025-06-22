import { sqliteTable, AnySQLiteColumn, integer, text, uniqueIndex, index, foreignKey, numeric } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const words = sqliteTable("Words", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	characters: text().notNull(),
	pinyin: text().notNull(),
	meaning: text().notNull(),
	frequencyRank: integer().notNull(),
	emojiChallenge: text(),
});

export const drillToWords = sqliteTable("_DrillToWords", {
	a: text("A").notNull().references(() => drill.slug, { onDelete: "cascade", onUpdate: "cascade" } ),
	b: integer("B").notNull().references(() => words.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	uniqueIndex("_DrillToWords_AB_unique").on(table.a, table.b),
	index().on(table.b),
]);

export const drillToPhrases = sqliteTable("_DrillToPhrases", {
	a: text("A").notNull().references(() => drill.slug, { onDelete: "cascade", onUpdate: "cascade" } ),
	b: integer("B").notNull().references(() => phrases.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	uniqueIndex("_DrillToPhrases_AB_unique").on(table.a, table.b),
	index().on(table.b),
]);

export const phrasesToWords = sqliteTable("_PhrasesToWords", {
	a: integer("A").notNull().references(() => phrases.id, { onDelete: "cascade", onUpdate: "cascade" } ),
	b: integer("B").notNull().references(() => words.id, { onDelete: "cascade", onUpdate: "cascade" } ),
},
(table) => [
	index().on(table.b),
	uniqueIndex("_PhrasesToWords_AB_unique").on(table.a, table.b),
]);

export const prismaMigrations = sqliteTable("_prisma_migrations", {
	id: text().primaryKey().notNull(),
	checksum: text().notNull(),
	finishedAt: numeric("finished_at"),
	migrationName: text("migration_name").notNull(),
	logs: text(),
	rolledBackAt: numeric("rolled_back_at"),
	startedAt: numeric("started_at").default(sql`(current_timestamp)`).notNull(),
	appliedStepsCount: integer("applied_steps_count").default(0).notNull(),
});

export const course = sqliteTable("Course", {
	slug: text().primaryKey().notNull(),
	title: text().notNull(),
	ordering: integer().notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const drill = sqliteTable("Drill", {
	slug: text().primaryKey().notNull(),
	title: text().notNull(),
	description: text().notNull(),
	lessonSlug: text().notNull().references(() => lesson.slug, { onDelete: "restrict", onUpdate: "cascade" } ),
	order: integer().default(0).notNull(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const lesson = sqliteTable("Lesson", {
	slug: text().primaryKey().notNull(),
	title: text().notNull(),
	ordering: integer().notNull(),
	courseSlug: text().notNull().references(() => course.slug, { onDelete: "restrict", onUpdate: "cascade" } ),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const phrases = sqliteTable("Phrases", {
	id: integer().primaryKey({ autoIncrement: true }).notNull(),
	characters: text().notNull(),
	pinyin: text().notNull(),
	meaning: text().notNull(),
	emojiChallenge: text(),
	createdAt: numeric().default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

