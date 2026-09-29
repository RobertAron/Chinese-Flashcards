export type DailyPart = "words" | "phrases";
export const dailyParts: DailyPart[] = ["words", "phrases"];

export const dailyPartInfo = {
  words: { number: 1, title: "Words", next: "phrases", passes: 3, questionsPerItem: 3 },
  phrases: { number: 2, title: "Phrases", next: null, passes: 1, questionsPerItem: 5 },
} as const satisfies Record<
  DailyPart,
  { number: number; title: string; next: DailyPart | null; passes: number; questionsPerItem: number }
>;

export function isDailyPart(part: string): part is DailyPart {
  return part === "words" || part === "phrases";
}
