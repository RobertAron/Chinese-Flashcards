/**
 * Parses the vocabulary list (词汇大纲) out of the official HSK 3.0 syllabus PDF
 * (sources/hsk-official/official-hsk.pdf) into sources/hsk-official/words.json.
 *
 *   bun run parse:hsk-official
 */
import { readFile, writeFile } from "node:fs/promises";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import type { OfficialHskWord } from "../src/sources/hskOfficial";
import type { HskLevel } from "../src/types";

const sourceDirectory = new URL("../sources/hsk-official/", import.meta.url);
const pdfPath = new URL("official-hsk.pdf", sourceDirectory).pathname;
const outputPath = new URL("words.json", sourceDirectory).pathname;

/** A run of text, positioned from the page's top-left corner in PDF points. */
type PdfWord = { page: number; left: number; top: number; width: number; text: string };

/** Left edges of the table columns, in PDF points. */
const columnStarts = { id: 0, level: 115, word: 215, pinyin: 305, partsOfSpeech: 430 } as const;
type Column = keyof typeof columnStarts;
const columns = Object.keys(columnStarts) as Column[];

/** Words whose tops are this close (in points) are on the same row. */
const rowTolerance = 4;

const levelsByLabel: Record<string, HskLevel> = {
  "1": "hsk1",
  "2": "hsk2",
  "3": "hsk3",
  "4": "hsk4",
  "5": "hsk5",
  "6": "hsk6",
  "7-9": "hsk7",
};

/**
 * The PDF's font draws full-width parentheses with private-use code points, and some characters with
 * Kangxi radical lookalikes (⼈ for 人); NFKC folds those and turns （） into ().
 */
const toUnicode = (text: string) =>
  text.replaceAll("\uE00C", "(").replaceAll("\uE00D", ")").normalize("NFKC").trim();

/** The 国际汉考 watermark is drawn rotated; table text has no skew in its transform. */
const isUpright = (item: TextItem) => item.transform[1] === 0 && item.transform[2] === 0;

const readPageWords = async (pdf: Awaited<ReturnType<typeof getDocument>["promise"]>, page: number) => {
  const pdfPage = await pdf.getPage(page);
  const pageHeight = pdfPage.view[3]!;
  const { items } = await pdfPage.getTextContent();
  return items
    .filter((item): item is TextItem => "str" in item && isUpright(item))
    .map((item) => ({
      page,
      left: item.transform[4]!,
      // PDF y runs up from the bottom of the page.
      top: pageHeight - item.transform[5]!,
      width: item.width,
      text: toUnicode(item.str),
    }))
    .filter((word) => word.text);
};

const readPdfWords = async (): Promise<PdfWord[]> => {
  const pdf = await getDocument({ data: new Uint8Array(await readFile(pdfPath)) }).promise;
  const pages = Array.from({ length: pdf.numPages }, (_, index) => index + 1);
  const words = await Promise.all(pages.map((page) => readPageWords(pdf, page)));
  return words.flat();
};

const columnOf = (left: number) => columns.findLast((column) => left >= columnStarts[column])!;

/** Groups words into rows of text: same page, tops within `rowTolerance`. */
const groupRows = (words: PdfWord[]) => {
  const sorted = words.toSorted((a, b) => a.page - b.page || a.top - b.top);
  const rowStarts = sorted.flatMap((word, index) => {
    const previous = sorted[index - 1];
    const startsRow = !previous || previous.page !== word.page || word.top - previous.top >= rowTolerance;
    return startsRow ? [index] : [];
  });
  return rowStarts.map((start, index) => sorted.slice(start, rowStarts[index + 1]));
};

/** pdf.js can split one word into runs (嗯's "ǹg" arrives as "ǹ" + "g"); runs that touch are one word. */
const touchesPrevious = (word: PdfWord, previous?: PdfWord) =>
  previous !== undefined && word.left - (previous.left + previous.width) < 1;

/** Joins a row's words into its cells, dropping words printed twice at the same spot. */
const toCells = (row: PdfWord[]) =>
  Object.fromEntries(
    columns.map((column) => [
      column,
      row
        .filter((word) => columnOf(word.left) === column)
        .filter(
          (word, index, cell) =>
            cell.findIndex((other) => other.text === word.text && Math.abs(other.left - word.left) < 1) ===
            index,
        )
        .sort((a, b) => a.left - b.left)
        .map((word, index, cell) => (touchesPrevious(word, cell[index - 1]) ? word.text : ` ${word.text}`))
        .join("")
        .trim(),
    ]),
  ) as Record<Column, string>;

/** Splits "1(2)(4)" into ["1", "2", "4"], or "形、介、(动、量)" into ["形、介", "动、量"]. */
const splitParenthesized = (text: string) =>
  [text.replace(/\(.*$/, ""), ...[...text.matchAll(/\(([^)]*)\)/g)].map((match) => match[1]!)].map((part) =>
    part.replace(/^、|、$/g, "").trim(),
  );

const splitPartsOfSpeech = (text: string) =>
  text
    .split("、")
    .map((part) => part.trim())
    .filter(Boolean);

const toOfficialWord = (cells: Record<Column, string>): OfficialHskWord | undefined => {
  const levels = splitParenthesized(cells.level).map((label) => levelsByLabel[label]);
  const [partsOfSpeech = "", ...laterPartsOfSpeech] = splitParenthesized(cells.partsOfSpeech);
  const [, simplified, homograph] = cells.word.match(/^(.+?)(\d*)$/) ?? [];
  const [hskLevel, ...laterLevels] = levels;
  const isWellFormed =
    /^\d+$/.test(cells.id) &&
    simplified &&
    levels.every((level) => level !== undefined) &&
    laterLevels.length === laterPartsOfSpeech.length;
  if (!isWellFormed || !hskLevel) return undefined;
  return {
    id: Number(cells.id),
    simplified,
    ...(homograph ? { homograph: Number(homograph) } : {}),
    hskLevel,
    pinyin: cells.pinyin,
    partsOfSpeech: splitPartsOfSpeech(partsOfSpeech),
    laterSenses: laterLevels.map((level, index) => ({
      hskLevel: level!,
      partsOfSpeech: splitPartsOfSpeech(laterPartsOfSpeech[index]!),
    })),
  };
};

const allCells = groupRows(await readPdfWords()).map(toCells);
const words = allCells.flatMap((cells) => toOfficialWord(cells) ?? []);

// Rows that start with a number in the id column but didn't parse are table rows we failed on.
const skipped = allCells.filter((cells) => /^\d+$/.test(cells.id) && cells.level && !toOfficialWord(cells));
const missingIds = words
  .map((word) => word.id)
  .filter((id, index, ids) => index > 0 && id !== ids[index - 1]! + 1);

await writeFile(outputPath, `${JSON.stringify(words, null, 1)}\n`);

const countsByLevel = Object.groupBy(words, (word) => word.hskLevel);
console.log(`Wrote ${words.length} words to ${outputPath}`);
console.log(Object.fromEntries(Object.entries(countsByLevel).map(([level, list]) => [level, list!.length])));
if (skipped.length) console.warn(`Skipped ${skipped.length} unparseable rows:`, skipped);
if (missingIds.length) console.warn("Gaps in row numbers before ids:", missingIds);
