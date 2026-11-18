import { loadCompleteHsk } from "./sources/completeHsk";
import { hskLevels, type ReferenceEntry } from "./types";

export * from "./types";

/** Every source's loader. Add new sources here; earlier sources win when values conflict. */
const sourceLoaders = [loadCompleteHsk];

const unique = <T>(values: T[]) => [...new Set(values)];

const lowerHskLevel = (a: ReferenceEntry["hskLevel"], b: ReferenceEntry["hskLevel"]) =>
  a && b ? hskLevels[Math.min(hskLevels.indexOf(a), hskLevels.indexOf(b))] : (a ?? b);

const mergeEntries = (a: ReferenceEntry, b: ReferenceEntry): ReferenceEntry => ({
  simplified: a.simplified,
  readings: [
    ...a.readings,
    ...b.readings.filter(
      (reading) =>
        !a.readings.some(
          (existing) => existing.pinyin === reading.pinyin && existing.source === reading.source,
        ),
    ),
  ],
  hskLevel: lowerHskLevel(a.hskLevel, b.hskLevel),
  frequencyRank: a.frequencyRank ?? b.frequencyRank,
  radical: a.radical ?? b.radical,
  partsOfSpeech: unique([...a.partsOfSpeech, ...b.partsOfSpeech]),
  sources: unique([...a.sources, ...b.sources]),
});

let referencePromise: Promise<Map<string, ReferenceEntry>> | undefined;

/** All reference entries keyed by simplified characters. Loaded once and cached. */
export const loadReference = () => {
  referencePromise ??= Promise.all(sourceLoaders.map((load) => load())).then((sources) =>
    sources.flat().reduce((reference, entry) => {
      const existing = reference.get(entry.simplified);
      return reference.set(entry.simplified, existing ? mergeEntries(existing, entry) : entry);
    }, new Map<string, ReferenceEntry>()),
  );
  return referencePromise;
};

export const lookup = async (simplified: string) => (await loadReference()).get(simplified);
