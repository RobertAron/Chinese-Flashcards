import { relations } from "drizzle-orm/relations";
import { words, drillToWords, drill, phrases, drillToPhrases, phrasesToWords, lesson, course } from "./schema";

// Drill <-> Words (Many-to-Many)
export const drillToWordsRelations = relations(drillToWords, ({ one }) => ({
  word: one(words, {
    fields: [drillToWords.b], // `b` refers to `words.id`
    references: [words.id],
  }),
  drill: one(drill, {
    fields: [drillToWords.a], // `a` refers to `drill.slug`
    references: [drill.slug],
  }),
}));

export const wordsRelations = relations(words, ({ many }) => ({
  drillToWords: many(drillToWords),
  phrasesToWords: many(phrasesToWords),
}));

export const drillRelations = relations(drill, ({ one, many }) => ({
  drillToWords: many(drillToWords),
  drillToPhrases: many(drillToPhrases),
  lesson: one(lesson, {
    fields: [drill.lessonSlug],
    references: [lesson.slug],
  }),
}));

// Drill <-> Phrases (Many-to-Many)
export const drillToPhrasesRelations = relations(drillToPhrases, ({ one }) => ({
  phrase: one(phrases, {
    fields: [drillToPhrases.b], // `b` refers to `phrases.id`
    references: [phrases.id],
  }),
  drill: one(drill, {
    fields: [drillToPhrases.a], // `a` refers to `drill.slug`
    references: [drill.slug],
  }),
}));

export const phrasesRelations = relations(phrases, ({ many }) => ({
  drillToPhrases: many(drillToPhrases),
  phrasesToWords: many(phrasesToWords),
}));

// Phrases <-> Words (Many-to-Many)
export const phrasesToWordsRelations = relations(phrasesToWords, ({ one }) => ({
  word: one(words, {
    fields: [phrasesToWords.b], // `b` refers to `words.id`
    references: [words.id],
  }),
  phrase: one(phrases, {
    fields: [phrasesToWords.a], // `a` refers to `phrases.id`
    references: [phrases.id],
  }),
}));

// Lesson <-> Drills <-> Course
export const lessonRelations = relations(lesson, ({ one, many }) => ({
  drills: many(drill),
  course: one(course, {
    fields: [lesson.courseSlug],
    references: [course.slug],
  }),
}));

export const courseRelations = relations(course, ({ many }) => ({
  lessons: many(lesson),
}));
