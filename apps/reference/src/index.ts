import { loadCompleteHsk } from "./sources/completeHsk";
import { loadHskOfficial } from "./sources/hskOfficial";
import { type HskLevel, hskLevels, type ReferenceEntry, type SourceName, type SourceRecords } from "./types";

export * from "./types";

type SourceLoader<Source extends SourceName> = () => Promise<
  Map<string, { simplified: string; record: SourceRecords[Source] }[]>
>;

/** Every source's loader, keyed by source name. Add new sources here. */
const sourceLoaders: { [Source in SourceName]: SourceLoader<Source> } = {
  "complete-hsk": loadCompleteHsk,
  "hsk-official": loadHskOfficial,
};

const sourceNames = Object.keys(sourceLoaders) as SourceName[];

const lowestHskLevel = (records: { hskLevel: HskLevel }[]) =>
  records.map((record) => record.hskLevel).sort((a, b) => hskLevels.indexOf(a) - hskLevels.indexOf(b))[0];

/** The official syllabus outranks complete-hsk, which is based on an earlier draft. */
const consolidatedHskLevel = (sources: ReferenceEntry["sources"]) =>
  lowestHskLevel(sources["hsk-official"]) ?? lowestHskLevel(sources["complete-hsk"]);

const buildReference = async () => {
  const loaded = await Promise.all(sourceNames.map((source) => sourceLoaders[source]()));
  const words = new Set(loaded.flatMap((bySimplified) => [...bySimplified.keys()]));
  return new Map(
    [...words].map((simplified): [string, ReferenceEntry] => {
      const sources = Object.fromEntries(
        sourceNames.map((source, index) => [
          source,
          (loaded[index]!.get(simplified) ?? []).map((entry) => entry.record),
        ]),
      ) as ReferenceEntry["sources"];
      return [simplified, { simplified, hskLevel: consolidatedHskLevel(sources), sources }];
    }),
  );
};

let referencePromise: Promise<Map<string, ReferenceEntry>> | undefined;

/** All reference entries keyed by simplified characters. Loaded once and cached. */
export const loadReference = () => {
  referencePromise ??= buildReference();
  return referencePromise;
};

export const lookup = async (simplified: string) => (await loadReference()).get(simplified);
