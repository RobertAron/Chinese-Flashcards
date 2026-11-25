import { Database } from "bun:sqlite";
import type { Project } from "./project";

/**
 * review.db schema. See README.md ("review.db") for what each column means.
 * Times are seconds on the video's timeline unless a column says otherwise.
 */
const schema = `
CREATE TABLE IF NOT EXISTS cues (
  id INTEGER PRIMARY KEY,
  start REAL NOT NULL,
  end REAL NOT NULL,
  english TEXT NOT NULL,
  ocr_text TEXT,
  ocr_alt TEXT,
  ocr_confidence REAL
);
CREATE TABLE IF NOT EXISTS phrases (
  id INTEGER PRIMARY KEY,
  first_cue INTEGER NOT NULL UNIQUE REFERENCES cues(id),
  last_cue INTEGER NOT NULL REFERENCES cues(id),
  start REAL NOT NULL,
  end REAL NOT NULL,
  clip_start REAL,
  clip_end REAL,
  ocr_text TEXT NOT NULL,
  english_cue TEXT NOT NULL,
  chinese TEXT NOT NULL,
  meaning TEXT NOT NULL,
  words TEXT,
  hsk_level INTEGER,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'auto_rejected', 'approved', 'rejected')),
  reject_reason TEXT,
  trim_start REAL,
  trim_end REAL,
  frame INTEGER,
  crop_x REAL,
  note TEXT,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS frames (
  phrase_id INTEGER NOT NULL REFERENCES phrases(id) ON DELETE CASCADE,
  idx INTEGER NOT NULL,
  time REAL NOT NULL,
  saliency_x REAL,
  PRIMARY KEY (phrase_id, idx)
);
CREATE TABLE IF NOT EXISTS gap_hits (
  time REAL PRIMARY KEY,
  ocr_text TEXT NOT NULL
);
`;

export type CueRow = {
  id: number;
  start: number;
  end: number;
  english: string;
  ocr_text: string | null;
  ocr_alt: string | null;
  ocr_confidence: number | null;
};

export const phraseStatuses = ["pending", "auto_rejected", "approved", "rejected"] as const;
export type PhraseStatus = (typeof phraseStatuses)[number];

export type PhraseRow = {
  id: number;
  first_cue: number;
  last_cue: number;
  start: number;
  end: number;
  clip_start: number | null;
  clip_end: number | null;
  ocr_text: string;
  english_cue: string;
  chinese: string;
  meaning: string;
  words: string | null;
  hsk_level: number | null;
  status: PhraseStatus;
  reject_reason: string | null;
  trim_start: number | null;
  trim_end: number | null;
  frame: number | null;
  crop_x: number | null;
  note: string | null;
  updated_at: string;
};

export type FrameRow = { phrase_id: number; idx: number; time: number; saliency_x: number | null };

export function openDatabase(project: Pick<Project, "database">) {
  const database = new Database(project.database, { create: true, strict: true });
  database.run("PRAGMA journal_mode = WAL");
  database.run("PRAGMA foreign_keys = ON");
  database.run(schema);
  return database;
}
