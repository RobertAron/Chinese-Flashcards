# vocab-video-mining

Turns a film or episode into study-app phrases. Each phrase is a line of dialogue with its Chinese text, an English meaning, an audio clip and a square card image. The tools in this package do the extraction, and a local review app lets you approve or reject each phrase and fix it before anything is copied into the study app.

Everything produced for one video lives in that video's folder (the **project folder**), not in this repo. Only two things write to the study app: the `import` step (approved phrases) and the review app's **Missing from study app** panel (new words, such as names). Everything else only reads its `apps/db/local.db`, to split and level words.

## Requirements

- macOS. `swift/vision.swift` wraps Apple Vision (OCR, saliency), NaturalLanguage (word tokenizing) and the system's Mandarin-to-Latin transliteration (pinyin for names). `swiftc` from the Xcode command line tools builds it into `bin/vision` on first use, and rebuilds it whenever the source changes.
- For writing to the study app: the R2 keys (`ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `CF_R2_ENDPOINT`) and `GOOGLE_APPLICATION_CREDENTIALS` in `apps/www/.env.local`. The `mine` and `review` scripts load that file.
- ffmpeg 8 or newer. Its scaler tone-maps HDR (PQ/HLG) sources to SDR.
- A video with:
  - a **timed text subtitle stream** (ASS, SRT and so on), whose cue timings drive everything, and
  - **burned-in Chinese subtitles**, which are OCR'd.

  The two must line up cue for cue. Both Legend of Hei films do.

## Pipeline

Run each step from `apps/video-mining` with `bun run mine <step> <project folder>`. Each step only does work that's missing, so it's safe to re-run.

| Step | What it does |
| --- | --- |
| `init <folder> --video <file>` | Probes the video and writes `project.json` with defaults. Check `subtitleBand` and `imageArea` before going on (see below). |
| `cues <folder>` | Reads the timed subtitle stream into the `cues` table, one row per subtitle line, numbered in time order. |
| `ocr <folder>` | Crops the subtitle band at 35% and 70% through each cue and OCRs it with Vision. Saves `cues.ocr_text`, plus `ocr_alt` when the two readings differ. The crops stay in `work/bands/` for checking. |
| `gaps <folder>` | Coverage check. Samples the band every 1.5 s wherever there's no cue for 3 s or more, and lists any Chinese it finds (`gap_hits`). Hits are burned-in lines the subtitle track is missing. |
| `annotate-export <folder> [from] [to]` | Prints cues as tab-separated lines (id, start, duration, English, OCR) for the annotation step. |
| `annotate-apply <folder> <file.json>` | Creates phrases from an annotation file (format below), then splits and levels their words. |
| `media <folder>` | For every phrase: cuts the audio clip to `audio/<id>.mp3`, saves candidate frames to `frames/<id>-<n>.jpg`, and runs Vision saliency to place the square crop. |
| `segment <folder> [--resplit]` | Re-levels every phrase against the current dictionary, for example after you change a word's level in the study app. `--resplit` also re-splits from the Chinese text, discarding hand-edited splits. |
| `import <folder> [--dry-run]` | Copies the approved phrases into the study app and uploads their media (see "Copying into the study app"). |

Then review with `bun run review <project folder>` (default port 4300, `--port` to change).

### Checking `project.json`

`init` guesses that the burned-in subtitles sit in the bottom 13% of the frame. Grab a frame where a subtitle is showing and confirm:

- `subtitleBand` (source pixels) contains the whole subtitle line and little else. OCR reads only this rectangle.
- `imageArea.y` + `imageArea.height` ends above the subtitles. Card images are squares `imageArea.height` tall, so the subtitles never appear in a card.

```bash
ffmpeg -ss 600 -i "<video>" -frames:v 1 -update 1 -vf "scale=1280:-2:out_transfer=bt709:out_primaries=bt709:out_color_matrix=bt709" check.png
```

Other settings:

- `audioChannel`: `"FC"` takes the 5.1 centre channel, which is mostly dialogue with little music. Use `"downmix"` for stereo sources.
- `audioStream` and `subtitleStream`: pick the streams when a file has several.
- `names`: character and place names. They count as level 0 and are never split. Add them during annotation.
- `countAsHsk1`: words this video treats as HSK 1 whatever their real level, so phrases built around them reach the beginner levels (师父 in Legend of Hei, used almost as a name). Usually set from the review app. Only phrase levels change; the study app's `Words` keep their real level.
- `clipPadding`: seconds kept around each phrase, clamped so a clip never reaches into the neighbouring cue's speech.
- `course`: the study-app courses `import` writes (slug and titles). Needed only for `import`.
- `framesPerPhrase`: number of candidate frames saved per phrase.

## Annotation

The annotation step is done by Claude, reading the `annotate-export` output in batches. For each cue it decides:

- **Merge or not.** Back-to-back cues that are one sentence split over two subtitle lines (收拾一下 / 我们出发 → 收拾一下，我们出发。) become one phrase.
- **Keep or reject.** Keep lines that are more than an exclamation and make sense without the scene. Rejected lines still become phrases, with status `auto_rejected` and a short `reason` (exclamation, fragment, needs context, name only). They're hidden in the review app by default but can be rescued.
- **Chinese text.** Fix OCR mistakes and add full-width punctuation (，。？！), since burned-in subtitles usually have none. Drop pure interjections such as 哦 or 唔 when the rest stands on its own.
  - OCR misreads white text over light backgrounds: it drops edge characters and swaps look-alikes (愉懊 for 愉快). When a line looks wrong or doesn't match the English, look at its crop in `work/bands/<cue>-0.jpg`.
  - Write particles the way the study app does: the question particle 么 as 吗, 咯 as 了, 哒 as 的, 喔 and 噢 as 哦. Keep 什么, 怎么 and 这么 as they are.
- **Meaning.** Translate from the Chinese, using the English cue for context. The cue is kept in `english_cue` for comparison. Machine-made English tracks can split sentences in odd places or swap the order of two lines, so follow the Chinese.
- **Names.** Add every character, place and named object to `names` in `project.json` before applying a batch, so they aren't split into unranked characters.

Annotation files go in the project's `annotations/` folder. Each is a JSON array:

```json
[
  { "cues": [12, 13], "keep": true, "chinese": "收拾一下，我们出发。", "meaning": "Get ready, we're leaving." },
  { "cues": [2], "keep": false, "reason": "exclamation" }
]
```

| Field | Meaning |
| --- | --- |
| `cues` | Consecutive cue ids that make up the phrase. Every cue should be in exactly one entry. |
| `keep` | `true` → status `pending` (to review). `false` → `auto_rejected`. |
| `chinese` | Required when kept. Defaults to the OCR text when rejected. |
| `meaning` | Required when kept. Defaults to the English cue when rejected. |
| `reason` | Why a line was rejected. Shown in the review app. |

`annotate-apply` skips entries whose first cue already has a phrase, so re-applying a file never overwrites review work.

## Project folder layout

```
<project folder>/
  <video file>
  project.json      settings for the tools (above)
  review.db         SQLite: cues, phrases, frames, gap_hits (below)
  annotations/      annotation batches (JSON), kept for provenance
  audio/<id>.mp3    one clip per phrase: mono MP3, the phrase plus padding
  frames/<id>-<n>.jpg  candidate frames: the image area above the subtitles, full width, 768 px tall
  work/             scratch: OCR crops (bands/, gaps/). Safe to delete.
```

## review.db

Times are seconds on the video's timeline unless noted otherwise.

### `cues`: one row per timed subtitle line

| Column | Meaning |
| --- | --- |
| `id` | Position in time order, starting at 1. |
| `start`, `end` | When the line is on screen. |
| `english` | The subtitle text, with formatting tags removed. |
| `ocr_text` | The burned-in Chinese, as OCR'd (no punctuation). |
| `ocr_alt` | A differing second OCR reading, if any. |
| `ocr_confidence` | Vision's lowest line confidence for `ocr_text`. |

### `phrases`: one row per candidate phrase (one cue, or several merged)

| Column | Meaning |
| --- | --- |
| `id` | Stable id. Audio and frame files are named after it. |
| `first_cue`, `last_cue` | The cue range the phrase covers. |
| `start`, `end` | `first_cue.start` to `last_cue.end`. |
| `clip_start`, `clip_end` | The span `audio/<id>.mp3` was cut from. |
| `ocr_text`, `english_cue` | The original OCR text and English cue(s), joined with spaces. Never edited. |
| `chinese` | The phrase text with punctuation. Editable. |
| `meaning` | English meaning. Editable. |
| `words` | `chinese` split into words, space-separated, punctuation included (`收拾 一下 ， 我们 出发 。`). Always spells out `chinese` exactly. |
| `hsk_level` | Cached phrase level (see Levelling): 0–7, or 8 for off-list. |
| `status` | `pending` (to review), `approved`, `rejected`, or `auto_rejected` (filtered out during annotation, not yet reviewed). |
| `reject_reason` | The annotation step's reason for `auto_rejected`. |
| `trim_start`, `trim_end` | Optional audio trim, in seconds **into the clip file**. `null` means untrimmed. The clip file itself is never changed. Export applies the trim. |
| `frame` | Which candidate frame is the card image (`frames.idx`). |
| `crop_x` | Manual horizontal position of the square crop, 0 (left edge) to 1 (right edge). `null` means use the frame's `saliency_x`. Same convention as CSS `background-position` percentages. |
| `note` | Free text. |
| `updated_at` | Last change. |

### `frames`: candidate card images

| Column | Meaning |
| --- | --- |
| `phrase_id`, `idx` | The file is `frames/<phrase_id>-<idx>.jpg`. |
| `time` | Where in the video it was taken. |
| `saliency_x` | Automatic crop position (0–1, as for `crop_x`), centred on Vision's salient objects. |

### `gap_hits`: output of the `gaps` coverage check

`time` and `ocr_text` for each sample where burned-in Chinese appeared with no cue.

### `word_readings`: readings picked in review

When the study app has several `Words` rows for a word, `import` uses the most frequent one unless a row here says otherwise. `phrase_id` and `position` (0-based, into `phrases.words`) identify the word; `study_word_id` is the `Words.id` to use. A phrase's rows are deleted whenever its words change.

### `study_phrases`: phrases `import` copied into the study app

| Column | Meaning |
| --- | --- |
| `phrase_id` | The phrase in this database. |
| `study_id` | Its `Phrases.id` in the study app, which also names its media on R2 (`phrases/<study_id>.mp3`, `.webp`). |
| `media` | The trim, frame and crop of the media last uploaded (JSON). Empty until the upload succeeds. |
| `imported_at` | When the phrase was first copied. |

### Producing a card image

Take `frames/<id>-<frame>.jpg` (height `H`, width `W`). The square is `H × H`, its left edge at `(W − H) × (crop_x ?? saliency_x)`. Crop, then resize to 768 × 768 WebP.

## Levelling

The rules match the first Legend of Hei course:

- `words` comes from a split that minimises unranked pieces, then the number of pieces, then the hardest level. Pieces can be dictionary words, names, single characters, or words Apple's tokenizer finds in that phrase.
  - Tokenizer words keep unknown compounds whole (会馆, 掩体, 师姐 rather than 会 馆 …). They never change a level, because ranked words still win when they cover the same characters.
  - Splitting along the tokenizer's boundaries was tried and dropped, because it breaks study-app words such as 一下, 不是 and 就是. The rare greedy merge (起点作用 split as 起点 作用 instead of 起 点 作用) is fixed by hand in the review app.
- **Dictionary.** Words the study app has use its `Words` rows. Their level is final even when unset, so 嗯 is unranked there. Words it doesn't have fall back to `vocab-reference`, and the review app flags them "not in study app yet".
- **Level 0.** Punctuation, `names`, and unranked interjections (嗯 喽 哟 唔 咦 呦 耶 哈 呗 诶 呃). Particles that have an HSK level keep it: 呀 4, 啦 6, 嘛 6, 哦 7.
- **`countAsHsk1`.** Words on the project's list are HSK 1, overriding the dictionary (an unranked word on the list stops making phrases off-list). They're also kept whole when splitting, like names.
- **Phrase level.** The hardest word's level (7 covers HSK 7–9). Any other unranked word makes the phrase off-list (8).

## Review app

`bun run review <project folder>` serves a page that reads and writes `review.db` directly.

- Filter by status, level or text, and sort by film order or easiest first.
- Mark phrases with the buttons or the keyboard:
  - `j`/`k` move between phrases,
  - space plays the clip,
  - `a` approves it, `x` rejects it, `p` sends it back to review.
- Click the Chinese or English to edit it. Editing the Chinese re-splits the words automatically.
- Click a word to see its pinyin, level and meaning.
  - **Count as HSK 1 in this film** adds it to `countAsHsk1` in `project.json` and re-levels every phrase; counted words have a dashed outline. The header lists them, and clicking one there removes it.
  - **Mark as name** / **Not a name** adds it to or removes it from `names` and re-levels every phrase.
  - **Reading in this phrase** appears when the study app has several `Words` rows for it (还 hái "still" or huán "give back"). The most frequent is the default; picking another is saved for this phrase (`word_readings`) and used by `import`. The chip's pinyin shows the reading in use.
- **Missing from study app** (header, shown while there are any) lists the words in approved or pending phrases that the study app doesn't have, approved ones first, since they block `import`. Each comes with suggested pinyin, meaning and level: names get macOS's transliteration (which knows name readings: 池长老 → Chízhǎnglǎo), written as one capitalised word, and a "Ruomu (name)" meaning; other words use `vocab-reference` where it has them. Check and edit them, then **Add to study app** creates the `Words` row (frequency rank 999999) and its `words/<id>.mp3` audio with Google TTS (voice `cmn-CN-Wavenet-B`, rate 0.75, the same as the study app's other words). Every word but punctuation needs a meaning.
- **Edit words** changes the split by hand. Separate words with spaces; they must spell out the Chinese exactly. **Auto-split** reverts to the automatic split.
- Trim the audio with start and end times in the clip (type them, or set them from the playhead). A valid trim saves itself half a second after you stop typing. **Play** and space play the trimmed range; the player's own controls play the whole clip.
- Click the card image to choose between candidate frames, and drag on the wide frame to move the square crop.

## Copying into the study app

`bun run mine import <project folder> [--dry-run]` copies every approved phrase into the study app. `--dry-run` checks everything and prints the planned courses, lessons and drills without writing or uploading anything. The `mine` script loads the R2 keys (`ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `CF_R2_ENDPOINT`) from `apps/www/.env.local`.

Set `course` in `project.json` first:

```json
"course": { "slug": "xiaohei2", "title": "🐈‍⬛ The Legend of Luo Xiaohei 2", "advancedTitle": "🐈‍⬛ Luo Xiaohei 2: HSK 2 and Up" }
```

### Before anything is written

- **Every word must already be in the study app.** The import never creates `Words`. If an approved phrase uses a word the study app doesn't have, it lists those words (with pinyin, level and an example phrase) and stops without changing anything. Add them first with the review app's **Missing from study app** panel.
- **Several readings.** When the study app has more than one `Words` row for the same characters (还 hái/huán, 好, 到), each phrase uses the reading picked in the review app, or the most frequent one. A note says how many phrases use each reading, so a wrong default stands out.
- **Media.** Every approved phrase needs its clip and chosen frame from the `media` step.

### What it writes

- **`Phrases` and `PhraseWords`** in `apps/db/local.db`: one row per approved phrase, with its `meaning` and `words` (punctuation included, as in the study app). `review.db`'s `study_phrases` table remembers each phrase's study-app id, so re-running updates the same rows.
- **Media on R2:** `phrases/<study id>.mp3` (the clip, cut to the trim with short fades, like the study app's admin trim) and `phrases/<study id>.webp` (the square crop, 768×768, WebP quality 75). Rendered files go to `work/import/`. Media is uploaded again only when a phrase's trim, frame or crop changed since the last upload.
- **Two courses, laid out like the first film's:**
  - `<slug>` holds the HSK 1 phrases (levels 0–1) in film order: lessons ("Part N · start–end") of 5 scenes of 4 phrases. Each "Scenes K" drill comes after a "Words for Scenes K" drill with its HSK 1 words the course hasn't taught yet (counted-as-HSK-1 words included; names, interjections and punctuation never).
  - `<slug>-advanced` holds everything else, level by level ("HSK 2 · Part N" … "HSK 7–9", "Off the HSK list" as `<slug>-extra-N`): lessons of 5 scenes of 5 phrases, each starting with "Learn the Words" for the words at its own level the course hasn't taught yet.
  - Both courses' lessons and drills are rebuilt on every run, so approving more phrases later can shift which drill a phrase is in. Study progress is kept per word and phrase, so nothing is lost. Other courses are never touched.

A phrase that was imported and later un-approved stays in the study app's `Phrases` (with its media) but drops out of every drill; the import lists them.
