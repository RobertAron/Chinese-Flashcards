# vocab-reference

Reference data for Chinese words (definitions, frequency, HSK level) from several sources, gathered into a single `ReferenceEntry` per simplified word. Each entry keeps every source's data separately under `sources`, plus one consolidated `hskLevel`.

```ts
import { loadReference, lookup } from "vocab-reference";

const entry = await lookup("爱");
// { simplified, hskLevel, sources: { "complete-hsk": [...], "hsk-official": [...] } }
const all = await loadReference(); // Map<simplified, ReferenceEntry>
```

From the command line:

```bash
bun run lookup 爱 学习
```

The data is read from disk with `node:fs`, so use it from scripts, server code or dev-only routes, not from client components.

Reference pinyin is dictionary pinyin with spaces between syllables or words, depending on the source. `Words.pinyin` in vocab-db is written without spaces, so strip spaces before comparing.

## Sources

| Name | Directory | Provides |
| --- | --- | --- |
| `complete-hsk` | `sources/complete-hsk` | HSK 3.0 levels 1–7, meanings, pinyin, frequency rank, radical, part of speech. From [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary). |
| `hsk-official` | `sources/hsk-official` | HSK 3.0 levels 1–7, pinyin, part of speech (in Chinese, e.g. 动) and senses added at later levels, from the official syllabus PDF. The authority on HSK level. Regenerate `words.json` with `bun run parse:hsk-official`. |

## Adding a source

1. Put the raw data under `sources/<name>/`, with a README linking to where it came from.
2. Write `src/sources/<name>.ts` exporting the source's record type and a loader that returns its records grouped by simplified word.
3. Add the record type to `SourceRecords` in `src/types.ts`, and the loader to `sourceLoaders` in `src/index.ts`.

`hskLevel` on an entry is the official syllabus's level when it lists the word, otherwise complete-hsk's lowest level.
