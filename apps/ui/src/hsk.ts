/** The study app's HSK levels (its Prisma `HskLevel` enum). `hsk7` covers HSK 7–9. */
export const hskLevels = ["hsk1", "hsk2", "hsk3", "hsk4", "hsk5", "hsk6", "hsk7"] as const;
export type HskLevel = (typeof hskLevels)[number];

export const hskClasses: Record<HskLevel, string> = {
  hsk1: "bg-teal-300 text-black",
  hsk2: "bg-green-300 text-black",
  hsk3: "bg-lime-300 text-black",
  hsk4: "bg-yellow-300 text-black",
  hsk5: "bg-orange-300 text-black",
  hsk6: "bg-red-300 text-black",
  hsk7: "bg-red-400 text-black",
};

/** For words that aren't on any HSK list. */
export const noHskClasses = "bg-gray-200 text-black";
