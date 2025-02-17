import { relations } from "drizzle-orm/relations";
import { words, drillToWords, drill, phrases, drillToPhrases, phrasesToWords, lesson, course } from "./schema";

export const drillToWordsRelations = relations(drillToWords, ({one}) => ({
	word: one(words, {
		fields: [drillToWords.b],
		references: [words.id]
	}),
	drill: one(drill, {
		fields: [drillToWords.a],
		references: [drill.slug]
	}),
}));

export const wordsRelations = relations(words, ({many}) => ({
	drillToWords: many(drillToWords),
	phrasesToWords: many(phrasesToWords),
}));

export const drillRelations = relations(drill, ({one, many}) => ({
	drillToWords: many(drillToWords),
	drillToPhrases: many(drillToPhrases),
	lesson: one(lesson, {
		fields: [drill.lessonSlug],
		references: [lesson.slug]
	}),
}));

export const drillToPhrasesRelations = relations(drillToPhrases, ({one}) => ({
	phrase: one(phrases, {
		fields: [drillToPhrases.b],
		references: [phrases.id]
	}),
	drill: one(drill, {
		fields: [drillToPhrases.a],
		references: [drill.slug]
	}),
}));

export const phrasesRelations = relations(phrases, ({many}) => ({
	drillToPhrases: many(drillToPhrases),
	phrasesToWords: many(phrasesToWords),
}));

export const phrasesToWordsRelations = relations(phrasesToWords, ({one}) => ({
	word: one(words, {
		fields: [phrasesToWords.b],
		references: [words.id]
	}),
	phrase: one(phrases, {
		fields: [phrasesToWords.a],
		references: [phrases.id]
	}),
}));

export const lessonRelations = relations(lesson, ({one, many}) => ({
	drills: many(drill),
	course: one(course, {
		fields: [lesson.courseSlug],
		references: [course.slug]
	}),
}));

export const courseRelations = relations(course, ({many}) => ({
	lessons: many(lesson),
}));