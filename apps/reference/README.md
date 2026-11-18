# vocab-reference

Reference data for Chinese words (definitions, frequency, HSK level), consolidated from several sources into a single `ReferenceEntry` per simplified word.

```ts
import { loadReference, lookup } from "vocab-reference";

const entry = await lookup("爱"); // { simplified, readings, hskLevel, frequencyRank, ... }
const all = await loadReference(); // Map<simplified, ReferenceEntry>
```

From the command line:

```bash
bun run lookup 爱 学习
```

The data is read from disk with `node:fs`, so use it from scripts, server code or dev-only routes, not from client components.

Reference pinyin is dictionary pinyin with spaces between syllables. `Words.pinyin` in vocab-db is written without spaces, so strip spaces before comparing.

## Sources

| Name | Directory | Provides |
| --- | --- | --- |
| `complete-hsk` | `sources/complete-hsk` | HSK 3.0 levels 1–7, meanings, pinyin, frequency rank, radical, part of speech. From [drkameleon/complete-hsk-vocabulary](https://github.com/drkameleon/complete-hsk-vocabulary). |

## Adding a source

1. Put the raw data under `sources/<name>/`, with a README linking to where it came from.
2. Add `<name>` to `SourceName` in `src/types.ts`.
3. Write `src/sources/<name>.ts` exporting a loader that returns `ReferenceEntry[]`.
4. Add the loader to `sourceLoaders` in `src/index.ts`. Entries with the same simplified word are merged; earlier sources win when single values (frequency, radical) conflict, and the lowest HSK level wins.
