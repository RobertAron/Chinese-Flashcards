import { parseArgs } from "node:util";
import { applyAnnotations, exportForAnnotation } from "./steps/annotate";
import { extractCues } from "./steps/cues";
import { checkGaps } from "./steps/gaps";
import { importPhrases } from "./steps/import";
import { init } from "./steps/init";
import { extractMedia } from "./steps/media";
import { ocrCues } from "./steps/ocr";
import { segmentPhrases } from "./steps/segment";

const usage = `Usage: bun run mine <step> <project folder> [options]

Steps, in order (see README.md):
  init <folder> --video <file>         probe the video and write project.json
  cues <folder>                        read the timed subtitle track into review.db
  ocr <folder> [--force]               OCR the burned-in subtitles for every cue
  gaps <folder>                        look for burned-in lines the subtitle track is missing
  annotate-export <folder> [from] [to] print cues for annotation
  annotate-apply <folder> <file.json>  create phrases from an annotation file
  media <folder> [--force]             cut audio clips and candidate frames
  segment <folder> [--resplit]         re-level phrases against the current dictionary
  import <folder> [--dry-run]          copy approved phrases into the study app and upload their media`;

const { positionals, values } = parseArgs({
  args: Bun.argv.slice(2),
  allowPositionals: true,
  options: {
    video: { type: "string" },
    force: { type: "boolean" },
    resplit: { type: "boolean" },
    "dry-run": { type: "boolean" },
  },
});
const [step, folder, ...rest] = positionals;
if (step === undefined || folder === undefined) {
  console.log(usage);
  process.exit(1);
}

const steps: Record<string, () => Promise<void>> = {
  init: () => {
    if (values.video === undefined) throw new Error("init needs --video <file>");
    return init(folder, values.video, { force: values.force });
  },
  cues: () => extractCues(folder),
  ocr: () => ocrCues(folder, { force: values.force }),
  gaps: () => checkGaps(folder),
  "annotate-export": () =>
    exportForAnnotation(folder, Number(rest[0] ?? 1), rest[1] ? Number(rest[1]) : Number.POSITIVE_INFINITY),
  "annotate-apply": () => {
    if (rest[0] === undefined) throw new Error("annotate-apply needs an annotation file");
    return applyAnnotations(folder, rest[0]);
  },
  media: () => extractMedia(folder, { force: values.force }),
  segment: () => segmentPhrases(folder, { resplit: values.resplit }),
  import: () => importPhrases(folder, { dryRun: values["dry-run"] }),
};

const action = steps[step];
if (action === undefined) {
  console.log(usage);
  process.exit(1);
}
await action();
