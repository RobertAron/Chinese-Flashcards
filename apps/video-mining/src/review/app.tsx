import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Button } from "vocab-ui/Button";
import { cn } from "vocab-ui/cn";
import { hskClasses, hskLevels, noHskClasses } from "vocab-ui/hsk";
import { Kbd } from "vocab-ui/Kbd";
import z from "zod";
import type { PhraseStatus } from "../db";
import type { WordInfo } from "../dictionary";
import type { NewStudyWord } from "../study";
import type { MissingWord, PhraseView, ProjectView } from "./types";

const pageSize = 20;
type Patch = Partial<
  Pick<
    PhraseView,
    "status" | "chinese" | "meaning" | "words" | "trim_start" | "trim_end" | "frame" | "crop_x"
  > & { reading: { position: number; studyWordId: number } }
>;
type WordList = "names" | "countAsHsk1";
type SetWordList = (list: WordList, word: string, included: boolean) => Promise<void>;

async function sendJson<Result>(url: string, method: string, body: unknown): Promise<Result> {
  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error ?? `Request failed (${response.status})`);
  return result;
}
const getJson = <Result,>(url: string): Promise<Result> => fetch(url).then((response) => response.json());
type Filters = {
  status: PhraseStatus | "all";
  level: string;
  search: string;
  sort: "film" | "level";
  page: number;
};
const defaultFilters: Filters = { status: "pending", level: "all", search: "", sort: "film", page: 0 };

async function patchPhrase(id: number, patch: Patch): Promise<PhraseView> {
  const response = await fetch(`/api/phrases/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? `Request failed (${response.status})`);
  return body;
}

const readStored = <Value,>(key: string, fallback: Value): Value => {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallback : { ...fallback, ...JSON.parse(saved) };
  } catch {
    return fallback;
  }
};
const writeStored = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

const levelLabel = (level: number | null) =>
  level === null
    ? "?"
    : level <= 1
      ? "HSK 1"
      : level === 7
        ? "HSK 7–9"
        : level >= 8
          ? "Off-list"
          : `HSK ${level}`;
const levelFilterMatches = (filter: string, level: number | null) =>
  filter === "all" || (filter === "1" ? (level ?? 99) <= 1 : String(level) === filter);
/** The study app's HSK colours. Level 0 shares HSK 1's; off-list (8) gets the study app's "No HSK" grey. */
const levelColor = (level: number | null) => {
  const hskLevel = level === null ? undefined : hskLevels[Math.max(1, level) - 1];
  return hskLevel === undefined ? noHskClasses : hskClasses[hskLevel];
};
const shortcuts = [
  { keys: ["j", "k"], action: "move" },
  { keys: ["space"], action: "play" },
  { keys: ["a"], action: "approve" },
  { keys: ["x"], action: "reject" },
  { keys: ["p"], action: "back to review" },
];
const statusLabels: Record<PhraseStatus | "all", string> = {
  pending: "To review",
  approved: "Approved",
  rejected: "Rejected",
  auto_rejected: "Auto-rejected",
  all: "All",
};
const formatTime = (seconds: number) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

function App() {
  const [project, setProject] = useState<ProjectView | null>(null);
  const [phrases, setPhrases] = useState<PhraseView[] | null>(null);
  const [filters, setFiltersState] = useState<Filters>(() => readStored("review-filters", defaultFilters));
  const [focusedId, setFocusedId] = useState<number | null>(null);
  const [missing, setMissing] = useState<MissingWord[] | null>(null);
  const [showMissing, setShowMissing] = useState(false);
  const blockingCount = missing?.filter((word) => word.approvedPhrases > 0).length ?? 0;

  useEffect(() => {
    getJson<ProjectView>("/api/project").then(setProject);
    getJson<PhraseView[]>("/api/phrases").then(setPhrases);
    getJson<MissingWord[]>("/api/missing-words").then(setMissing);
  }, []);

  const setFilters = (change: Partial<Filters>) =>
    setFiltersState((current) => {
      const next = { ...current, page: 0, ...change };
      writeStored("review-filters", next);
      return next;
    });

  const counts = useMemo((): Record<string, number> => {
    const byStatus = Map.groupBy(phrases ?? [], (phrase) => phrase.status);
    return {
      ...Object.fromEntries([...byStatus].map(([status, list]) => [status, list.length])),
      all: phrases?.length ?? 0,
    };
  }, [phrases]);

  const visible = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const matching = (phrases ?? []).filter(
      (phrase) =>
        (filters.status === "all" || phrase.status === filters.status) &&
        levelFilterMatches(filters.level, phrase.hsk_level) &&
        (search === "" ||
          [phrase.chinese, phrase.meaning, phrase.english_cue].some((text) =>
            text.toLowerCase().includes(search),
          )),
    );
    return filters.sort === "level"
      ? matching.toSorted((a, b) => (a.hsk_level ?? 99) - (b.hsk_level ?? 99) || a.start - b.start)
      : matching;
  }, [phrases, filters]);

  const pageCount = Math.max(1, Math.ceil(visible.length / pageSize));
  const page = Math.min(filters.page, pageCount - 1);
  const pagePhrases = visible.slice(page * pageSize, (page + 1) * pageSize);

  const replacePhrase = (updated: PhraseView) =>
    setPhrases((current) => current?.map((phrase) => (phrase.id === updated.id ? updated : phrase)) ?? null);

  const reloadWords = async () => {
    const [nextPhrases, nextMissing] = await Promise.all([
      getJson<PhraseView[]>("/api/phrases"),
      getJson<MissingWord[]>("/api/missing-words"),
    ]);
    setPhrases(nextPhrases);
    setMissing(nextMissing);
  };

  /** Changes one of project.json's word lists. Every phrase's level can change, so they're all reloaded. */
  const setWordList: SetWordList = async (list, word, included) => {
    setProject(await sendJson<ProjectView>("/api/word-lists", "PUT", { list, word, included }));
    await reloadWords();
  };

  const addStudyWord = async (word: NewStudyWord) => {
    await sendJson("/api/study-words", "POST", word);
    await reloadWords();
  };

  // Moves focus to the next card first, because a status change can drop this card from the filtered list.
  const setStatus = async (phrase: PhraseView, status: PhraseStatus) => {
    const index = visible.findIndex((candidate) => candidate.id === phrase.id);
    const leavesList = filters.status !== "all" && filters.status !== status;
    const next = visible[index + 1];
    replacePhrase(await patchPhrase(phrase.id, { status }));
    if (leavesList || phrase.id === focusedId) setFocusedId(next?.id ?? null);
  };

  const latest = useRef({ pagePhrases, focusedId, setStatus });
  latest.current = { pagePhrases, focusedId, setStatus };
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || event.metaKey || event.ctrlKey) return;
      const { pagePhrases, focusedId, setStatus } = latest.current;
      const index = pagePhrases.findIndex((phrase) => phrase.id === focusedId);
      const focused = pagePhrases[index];
      const focusAt = (nextIndex: number) => {
        const next = pagePhrases[Math.max(0, Math.min(pagePhrases.length - 1, nextIndex))];
        if (next === undefined) return;
        setFocusedId(next.id);
        document.querySelector(`[data-phrase-id="${next.id}"]`)?.scrollIntoView({ block: "nearest" });
      };
      const actions: Record<string, () => void> = {
        j: () => focusAt(index + 1),
        k: () => focusAt(index - 1),
        a: () => focused && setStatus(focused, "approved"),
        x: () => focused && setStatus(focused, "rejected"),
        p: () => focused && setStatus(focused, "pending"),
        " ": () =>
          focused &&
          document.querySelector<HTMLButtonElement>(`[data-phrase-id="${focused.id}"] [data-play]`)?.click(),
      };
      const action = actions[event.key];
      if (action === undefined) return;
      // Captured and stopped so a focused button doesn't also take the key (space would press it).
      event.preventDefault();
      event.stopPropagation();
      action();
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, []);

  if (project === null || phrases === null) return <p className="p-6">Loading…</p>;

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 p-4">
      <header className="sticky top-0 z-10 -mx-4 flex flex-col gap-2 border-b border-slate-300 bg-slate-100/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="mr-2 text-lg font-semibold">{project.name}</h1>
          {(["pending", "approved", "rejected", "auto_rejected", "all"] as const).map((status) => (
            <Button
              key={status}
              onPress={() => setFilters({ status })}
              className={cn("px-3 text-sm", filters.status === status && "bg-black text-white")}
            >
              {statusLabels[status]} <span className="opacity-60">{counts[status] ?? 0}</span>
            </Button>
          ))}
          {missing !== null && missing.length > 0 && (
            <Button
              onPress={() => setShowMissing((shown) => !shown)}
              className={cn(
                "ml-auto flex items-center gap-1.5 px-3 text-sm",
                showMissing && "bg-black text-white",
              )}
            >
              Missing from study app <span className="opacity-60">{missing.length}</span>
              {blockingCount > 0 && (
                <span className="rounded-full bg-rose-300 px-1.5 text-xs text-black">
                  {blockingCount} block import
                </span>
              )}
            </Button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <select
            value={filters.level}
            onChange={(event) => setFilters({ level: event.target.value })}
            className="rounded border border-slate-300 bg-white px-2 py-1"
          >
            <option value="all">All levels</option>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
              <option key={level} value={String(level)}>
                {levelLabel(level)}
              </option>
            ))}
          </select>
          <select
            value={filters.sort}
            onChange={(event) => setFilters({ sort: event.target.value as Filters["sort"] })}
            className="rounded border border-slate-300 bg-white px-2 py-1"
          >
            <option value="film">Film order</option>
            <option value="level">Easiest first</option>
          </select>
          <input
            type="search"
            placeholder="Search Chinese or English"
            value={filters.search}
            onChange={(event) => setFilters({ search: event.target.value })}
            className="w-56 rounded border border-slate-300 bg-white px-2 py-1"
          />
          <Pager
            page={page}
            pageCount={pageCount}
            total={visible.length}
            onPage={(next) => setFilters({ page: next })}
          />
          <span className="ml-auto hidden flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 md:flex">
            {shortcuts.map(({ keys, action }) => (
              <span key={action} className="flex items-center gap-1">
                {keys.map((key) => (
                  <Kbd key={key} className="text-slate-900">
                    {key}
                  </Kbd>
                ))}
                {action}
              </span>
            ))}
          </span>
        </div>
        {project.countAsHsk1.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Counted as HSK 1 in this film:</span>
            {project.countAsHsk1.map((word) => (
              <Button
                key={word}
                aria-label={`Stop counting ${word} as HSK 1`}
                onPress={() => setWordList("countAsHsk1", word, false)}
                className="flex items-center gap-1 px-2"
              >
                {word} <span aria-hidden="true">×</span>
              </Button>
            ))}
          </div>
        )}
      </header>
      {showMissing && missing !== null && <MissingWords words={missing} onAdd={addStudyWord} />}
      {pagePhrases.length === 0 && <p className="p-6 text-slate-500">Nothing here.</p>}
      {pagePhrases.map((phrase) => (
        <PhraseCard
          key={phrase.id}
          phrase={phrase}
          project={project}
          isFocused={phrase.id === focusedId}
          onFocus={() => setFocusedId(phrase.id)}
          onChange={replacePhrase}
          onStatus={(status) => setStatus(phrase, status)}
          onWordList={setWordList}
        />
      ))}
      <div className="flex justify-center py-4">
        <Pager
          page={page}
          pageCount={pageCount}
          total={visible.length}
          onPage={(next) => {
            setFilters({ page: next });
            window.scrollTo({ top: 0 });
          }}
        />
      </div>
    </div>
  );
}

function Pager({
  page,
  pageCount,
  total,
  onPage,
}: {
  page: number;
  pageCount: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <Button
        aria-label="Previous page"
        isDisabled={page === 0}
        onPress={() => onPage(page - 1)}
        className="px-2"
      >
        ‹
      </Button>
      <span className="tabular-nums">
        {page + 1}/{pageCount} <span className="text-slate-500">({total})</span>
      </span>
      <Button
        aria-label="Next page"
        isDisabled={page >= pageCount - 1}
        onPress={() => onPage(page + 1)}
        className="px-2"
      >
        ›
      </Button>
    </span>
  );
}

const effectiveCrop = (phrase: PhraseView) =>
  phrase.crop_x ?? phrase.frames.find((frame) => frame.index === (phrase.frame ?? 0))?.saliencyX ?? 0.5;
const frameUrl = (phraseId: number, index: number) => `/media/frames/${phraseId}-${index}.jpg`;

function PhraseCard({
  phrase,
  project,
  isFocused,
  onFocus,
  onChange,
  onStatus,
  onWordList,
}: {
  phrase: PhraseView;
  project: ProjectView;
  isFocused: boolean;
  onFocus: () => void;
  onChange: (phrase: PhraseView) => void;
  onStatus: (status: PhraseStatus) => Promise<void>;
  onWordList: SetWordList;
}) {
  const [error, setError] = useState<string | null>(null);
  const [showImage, setShowImage] = useState(false);
  const attempt = async (action: () => Promise<void>) => {
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };
  const save = (patch: Patch) => attempt(async () => onChange(await patchPhrase(phrase.id, patch)));
  const hasFrames = phrase.frames.length > 0;

  return (
    <article
      data-phrase-id={phrase.id}
      // Capture, because react-aria buttons stop pointer events from bubbling.
      onPointerDownCapture={onFocus}
      className={cn(
        "flex flex-col gap-3 rounded-lg border bg-white p-3 shadow-sm",
        isFocused ? "border-sky-500 ring-2 ring-sky-400" : "border-slate-200",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <button
          type="button"
          onClick={() => setShowImage((shown) => !shown)}
          title="Choose image"
          className="shrink-0 self-start"
        >
          {hasFrames ? (
            <div
              className="size-40 rounded-md bg-slate-200"
              style={{
                backgroundImage: `url(${frameUrl(phrase.id, phrase.frame ?? 0)})`,
                backgroundSize: "auto 100%",
                backgroundPosition: `${effectiveCrop(phrase) * 100}% 0`,
              }}
            />
          ) : (
            <div className="flex size-40 items-center justify-center rounded-md bg-slate-200 text-xs text-slate-500">
              No frames yet
            </div>
          )}
        </button>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className={cn("rounded px-1.5 py-0.5 font-medium", levelColor(phrase.hsk_level))}>
              {levelLabel(phrase.hsk_level)}
            </span>
            <span className="text-slate-400">
              #{phrase.id} · {formatTime(phrase.start)} · cue {phrase.first_cue}
              {phrase.last_cue !== phrase.first_cue && `–${phrase.last_cue}`}
            </span>
            {phrase.status !== "pending" && (
              <span
                className={cn(
                  "rounded px-1.5 py-0.5",
                  phrase.status === "approved" ? "bg-emerald-600 text-white" : "bg-slate-500 text-white",
                )}
              >
                {statusLabels[phrase.status]}
                {phrase.reject_reason && `: ${phrase.reject_reason}`}
              </span>
            )}
          </div>
          <EditableText value={phrase.chinese} className="text-3xl" onSave={(chinese) => save({ chinese })} />
          <Words
            phrase={phrase}
            onSave={(words) => save({ words })}
            onReading={(position, studyWordId) => save({ reading: { position, studyWordId } })}
            onWordList={(list, word, included) => attempt(() => onWordList(list, word, included))}
          />
          <EditableText
            value={phrase.meaning}
            className="text-lg text-slate-700"
            onSave={(meaning) => save({ meaning })}
          />
          <p className="text-xs text-slate-400">
            Subtitle: {phrase.english_cue} · OCR: {phrase.ocr_text || "—"}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-2 sm:w-40 sm:flex-col sm:items-stretch">
          <Button
            onPress={() => onStatus("approved")}
            className={cn(statusButtonClasses, phrase.status === "approved" && "bg-emerald-300")}
          >
            Approve <Kbd>a</Kbd>
          </Button>
          <Button
            onPress={() => onStatus("rejected")}
            className={cn(
              statusButtonClasses,
              (phrase.status === "rejected" || phrase.status === "auto_rejected") && "bg-rose-300",
            )}
          >
            Reject <Kbd>x</Kbd>
          </Button>
          {phrase.status !== "pending" && (
            <Button onPress={() => onStatus("pending")} className={cn(statusButtonClasses, "text-xs")}>
              Back to review <Kbd>p</Kbd>
            </Button>
          )}
        </div>
      </div>
      <AudioTrim phrase={phrase} onSave={save} />
      {showImage && hasFrames && <ImagePicker phrase={phrase} project={project} onSave={save} />}
      {error && <p className="text-sm text-rose-700">{error}</p>}
    </article>
  );
}

const statusButtonClasses =
  "flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium whitespace-nowrap";

function EditableText({
  value,
  className,
  onSave,
}: {
  value: string;
  className?: string;
  onSave: (value: string) => Promise<void>;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  if (draft === null) {
    return (
      <button
        type="button"
        onClick={() => setDraft(value)}
        className={cn("text-left hover:bg-amber-50", className)}
        title="Click to edit"
      >
        {value}
      </button>
    );
  }
  const commit = async () => {
    const trimmed = draft.trim();
    if (trimmed !== "" && trimmed !== value) await onSave(trimmed);
    setDraft(null);
  };
  return (
    <input
      // biome-ignore lint/a11y/noAutofocus: opened by an explicit click
      autoFocus
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit();
        if (event.key === "Escape") setDraft(null);
      }}
      className={cn("w-full rounded border border-amber-400 px-1", className)}
    />
  );
}

const kindStyles: Record<WordInfo["kind"], string> = {
  hsk: "",
  name: "bg-slate-100 text-slate-600",
  particle: "bg-slate-100 text-slate-600",
  punctuation: "text-slate-400",
  unranked: "bg-red-100 text-red-900 ring-1 ring-red-400",
};

/** Whether counting the word as HSK 1 would lower anything (or undo an earlier count). */
const canCountAsHsk1 = (word: WordInfo) =>
  word.countedAsHsk1 || word.kind === "unranked" || (word.kind === "hsk" && (word.level ?? 0) > 1);

const describeLevel = (word: WordInfo) => {
  const dictionary =
    word.dictionaryLevel === null ? "not on the HSK lists" : levelLabel(word.dictionaryLevel);
  const level = {
    hsk: word.countedAsHsk1 ? `counted as HSK 1 in this film (dictionary: ${dictionary})` : dictionary,
    name: "name, level 0",
    particle: "interjection, level 0",
    punctuation: "punctuation",
    unranked: "not on the HSK lists",
  }[word.kind];
  return word.inStudyApp ? level : `${level} · not in study app yet`;
};

type PhraseWord = PhraseView["wordInfo"][number];

/** The pinyin of the study-app reading this phrase uses (the first reading unless review picked another). */
const readingPinyin = (word: PhraseWord) =>
  word.readings.find((reading) => reading.id === word.readingId)?.pinyin ?? word.pinyin[0] ?? "";

function Words({
  phrase,
  onSave,
  onReading,
  onWordList,
}: {
  phrase: PhraseView;
  onSave: (words: string | null) => Promise<void>;
  onReading: (position: number, studyWordId: number) => Promise<void>;
  onWordList: SetWordList;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const selectedWord = selected === null ? undefined : phrase.wordInfo[selected];
  if (draft !== null) {
    return (
      <div className="flex items-center gap-2">
        <input
          // biome-ignore lint/a11y/noAutofocus: opened by an explicit click
          autoFocus
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onSave(draft).then(() => setDraft(null));
            if (event.key === "Escape") setDraft(null);
          }}
          className="flex-1 rounded border border-amber-400 px-1 text-lg"
        />
        <Button className="px-2 text-sm" onPress={() => onSave(draft).then(() => setDraft(null))}>
          Save
        </Button>
        <Button className="px-2 text-sm" onPress={() => onSave(null).then(() => setDraft(null))}>
          Auto-split
        </Button>
        <Button className="px-2 text-sm" onPress={() => setDraft(null)}>
          Cancel
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-end gap-1">
        {phrase.wordInfo.map((word, index) => {
          const key = `${index}-${word.characters}`;
          const chipClasses = cn(
            "flex flex-col items-center rounded px-1 leading-tight",
            word.kind === "hsk" ? levelColor(word.level) : kindStyles[word.kind],
            word.countedAsHsk1 && "outline-1 outline-slate-700 outline-dashed",
          );
          const content = (
            <>
              <span className="text-[10px] opacity-70">
                {word.kind === "punctuation" ? "\u00a0" : readingPinyin(word)}
              </span>
              <span>{word.characters}</span>
            </>
          );
          if (word.kind === "punctuation") {
            return (
              <span key={key} className={chipClasses}>
                {content}
              </span>
            );
          }
          return (
            <button
              key={key}
              type="button"
              aria-pressed={index === selected}
              title={word.meaning ?? undefined}
              onClick={() => setSelected(index === selected ? null : index)}
              className={cn(
                chipClasses,
                "hover:ring-1 hover:ring-black",
                index === selected && "ring-2 ring-black",
              )}
            >
              {content}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setDraft(phrase.words ?? "")}
          className="ml-1 text-xs text-slate-500 underline"
        >
          edit words
        </button>
      </div>
      {selectedWord && selected !== null && (
        <WordDetails
          word={selectedWord}
          onReading={(studyWordId) => onReading(selected, studyWordId)}
          onWordList={onWordList}
        />
      )}
    </div>
  );
}

function WordDetails({
  word,
  onReading,
  onWordList,
}: {
  word: PhraseWord;
  onReading: (studyWordId: number) => Promise<void>;
  onWordList: SetWordList;
}) {
  const hasChoice = word.readings.length > 1;
  const isName = word.kind === "name";
  return (
    <div className="flex flex-col gap-1.5 rounded bg-slate-50 px-2 py-1.5 text-sm">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span className="text-lg">{word.characters}</span>
        {!hasChoice && <span>{readingPinyin(word)}</span>}
        <span className="text-slate-500">{describeLevel(word)}</span>
        {!hasChoice && word.meaning && (
          <span className="min-w-0 flex-1 truncate text-slate-700" title={word.meaning}>
            {word.meaning}
          </span>
        )}
        <span className="ml-auto flex flex-wrap gap-2">
          {canCountAsHsk1(word) && (
            <Button
              className="px-2 text-sm whitespace-nowrap"
              onPress={() => onWordList("countAsHsk1", word.characters, !word.countedAsHsk1)}
            >
              {word.countedAsHsk1 ? "Stop counting as HSK 1" : "Count as HSK 1 in this film"}
            </Button>
          )}
          <Button
            className="px-2 text-sm whitespace-nowrap"
            onPress={() => onWordList("names", word.characters, !isName)}
          >
            {isName ? "Not a name" : "Mark as name"}
          </Button>
        </span>
      </div>
      {hasChoice && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-slate-500">Reading in this phrase:</span>
          {word.readings.map((reading) => (
            <Button
              key={reading.id}
              aria-pressed={reading.id === word.readingId}
              onPress={() => onReading(reading.id)}
              className={cn(
                "max-w-80 truncate px-2 text-sm",
                reading.id === word.readingId && "bg-black text-white",
              )}
            >
              {reading.pinyin} · {reading.meaning}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}

const hskLevelOptions = [1, 2, 3, 4, 5, 6, 7];

/** Words the study app lacks, with suggested Words fields to check and add. */
function MissingWords({
  words,
  onAdd,
}: {
  words: MissingWord[];
  onAdd: (word: NewStudyWord) => Promise<void>;
}) {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <div className="flex flex-col gap-0.5">
        <h2 className="font-semibold">Missing from the study app</h2>
        <p className="text-sm text-slate-600">
          Words in approved or pending phrases that the study app doesn't have yet. An approved phrase that
          uses one can't be imported until it's added. Adding creates its Words row and its audio (Google
          text-to-speech) in the study app, so check the pinyin first: names are one capitalised word
          (Xiǎohēi).
        </p>
      </div>
      {words.map((word) => (
        <MissingWordRow key={word.characters} word={word} onAdd={onAdd} />
      ))}
    </section>
  );
}

function MissingWordRow({
  word,
  onAdd,
}: {
  word: MissingWord;
  onAdd: (word: NewStudyWord) => Promise<void>;
}) {
  const [pinyin, setPinyin] = useState(word.pinyin);
  const [meaning, setMeaning] = useState(word.meaning);
  const [hskLevel, setHskLevel] = useState(word.hskLevel);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const add = async () => {
    setIsAdding(true);
    setError(null);
    try {
      await onAdd({ characters: word.characters, pinyin: pinyin.trim(), meaning: meaning.trim(), hskLevel });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
      setIsAdding(false);
    }
  };
  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-2 text-sm">
      <span className="w-24 text-xl">{word.characters}</span>
      <span className="w-56 text-xs text-slate-500">
        {word.isName && "name · "}
        {word.approvedPhrases > 0 && (
          <span className="font-medium text-rose-700">{word.approvedPhrases} approved · </span>
        )}
        {word.pendingPhrases > 0 && `${word.pendingPhrases} to review · `}
        e.g. {word.example}
      </span>
      <input
        aria-label={`Pinyin for ${word.characters}`}
        value={pinyin}
        onChange={(event) => setPinyin(event.target.value)}
        className="w-36 rounded border border-slate-300 px-1"
      />
      <input
        aria-label={`Meaning of ${word.characters}`}
        placeholder="Meaning"
        value={meaning}
        onChange={(event) => setMeaning(event.target.value)}
        className="min-w-48 flex-1 rounded border border-slate-300 px-1"
      />
      <select
        aria-label={`HSK level of ${word.characters}`}
        value={hskLevel ?? ""}
        onChange={(event) => setHskLevel(event.target.value === "" ? null : Number(event.target.value))}
        className="rounded border border-slate-300 bg-white px-1 py-0.5"
      >
        <option value="">No HSK level</option>
        {hskLevelOptions.map((level) => (
          <option key={level} value={level}>
            {levelLabel(level)}
          </option>
        ))}
      </select>
      <Button
        // Punctuation has no meaning in the study app; every other word needs one.
        isDisabled={
          isAdding ||
          pinyin.trim() === "" ||
          (meaning.trim() === "" && !/^[\p{P}\p{S}]+$/u.test(word.characters))
        }
        onPress={add}
        className="px-2 text-sm whitespace-nowrap"
      >
        {isAdding ? "Adding…" : "Add to study app"}
      </Button>
      {error && <span className="w-full text-rose-700">{error}</span>}
    </div>
  );
}

const roundTime = (seconds: number) => Math.round(seconds * 100) / 100;
const seconds = (label: string) =>
  z
    .string()
    .trim()
    .nonempty(`${label} is empty`)
    .pipe(
      z.coerce
        .number<string>({ error: `${label} must be a number of seconds` })
        .min(0, `${label} can't be negative`),
    );
const trimRange = (duration: number) =>
  z
    .object({ start: seconds("Start"), end: seconds("End") })
    .refine(({ start, end }) => end > start, "End must be after start")
    .refine(({ end }) => end <= duration + 0.01, `End can't be past ${duration.toFixed(2)}s`);

const playLabels = ["Play", "Pause"];
const trimSaveDelay = 500;

/** A whole-clip range is stored as no trim. */
const trimPatch = (range: { start: number; end: number }, duration: number): Patch =>
  range.start < 0.01 && range.end > duration - 0.01
    ? { trim_start: null, trim_end: null }
    : { trim_start: range.start, trim_end: range.end };

/**
 * Trims are stored as seconds into the clip and applied on export; the clip file itself never changes.
 * Play plays the range in the inputs, and valid edits save themselves once typing pauses.
 */
function AudioTrim({ phrase, onSave }: { phrase: PhraseView; onSave: (patch: Patch) => Promise<void> }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const duration = roundTime((phrase.clip_end ?? 0) - (phrase.clip_start ?? 0));
  const [start, setStart] = useState(String(phrase.trim_start ?? 0));
  const [end, setEnd] = useState(String(phrase.trim_end ?? duration));
  const [stopAt, setStopAt] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const parsed = trimRange(duration).safeParse({ start, end });
  const range = parsed.success ? parsed.data : null;
  const error = parsed.success ? null : (parsed.error.issues[0]?.message ?? "Invalid trim");
  const isTrimmed = phrase.trim_start !== null || phrase.trim_end !== null;

  // `timeupdate` only fires about every 250 ms, too coarse to stop on the trim end; check every frame instead.
  useEffect(() => {
    if (!isPlaying || stopAt === null) return;
    let frame = 0;
    const stopAtEnd = () => {
      const audio = audioRef.current;
      if (audio !== null && audio.currentTime >= stopAt) return audio.pause();
      frame = requestAnimationFrame(stopAtEnd);
    };
    frame = requestAnimationFrame(stopAtEnd);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying, stopAt]);

  const edit = (next: { start: string; end: string }) => {
    setStart(next.start);
    setEnd(next.end);
    clearTimeout(saveTimer.current);
    const nextRange = trimRange(duration).safeParse(next);
    if (!nextRange.success) return;
    const patch = trimPatch(nextRange.data, duration);
    if (patch.trim_start === phrase.trim_start && patch.trim_end === phrase.trim_end) return;
    saveTimer.current = setTimeout(() => onSave(patch), trimSaveDelay);
  };
  const play = () => {
    const audio = audioRef.current;
    if (audio === null) return;
    if (isPlaying) return audio.pause();
    audio.currentTime = range?.start ?? phrase.trim_start ?? 0;
    setStopAt(range?.end ?? phrase.trim_end ?? duration);
    audio.play();
  };
  if (phrase.clip_start === null) return <p className="text-xs text-slate-500">No audio clip yet.</p>;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Button data-play onPress={play} className="grid-stack px-3 py-1.5 text-center font-medium">
        {/* Every label sits in the same cell so the button keeps the widest one's width. */}
        {playLabels.map((label) => (
          <span
            key={label}
            className={cn("grid-stack-item", label !== (isPlaying ? "Pause" : "Play") && "invisible")}
          >
            {label}
          </span>
        ))}
      </Button>
      <audio
        ref={audioRef}
        src={`/media/audio/${phrase.id}.mp3`}
        preload="none"
        controls
        className="h-8"
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          setStopAt(null);
        }}
        onTimeUpdate={(event) => {
          // Fallback for background tabs, where animation frames don't run.
          if (stopAt !== null && event.currentTarget.currentTime >= stopAt) event.currentTarget.pause();
        }}
      />
      <TimeInput
        label="Start"
        value={start}
        onChange={(value) => edit({ start: value, end })}
        onPlayhead={() => edit({ start: String(roundTime(audioRef.current?.currentTime ?? 0)), end })}
      />
      <TimeInput
        label="End"
        value={end}
        onChange={(value) => edit({ start, end: value })}
        onPlayhead={() => edit({ start, end: String(roundTime(audioRef.current?.currentTime ?? duration)) })}
      />
      <span className="text-slate-500">of {duration.toFixed(2)}s</span>
      {isTrimmed && (
        <button
          type="button"
          className="text-slate-500 underline"
          onClick={() => edit({ start: "0", end: String(duration) })}
        >
          Clear trim
        </button>
      )}
      {error && <span className="text-rose-700">{error}</span>}
    </div>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  onPlayhead,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onPlayhead: () => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-slate-600">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        aria-label={`${label} in seconds`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-16 rounded border border-slate-300 px-1"
      />
      <button type="button" className="text-xs text-slate-500 underline" onClick={onPlayhead}>
        playhead
      </button>
    </span>
  );
}

/** Pick a candidate frame, then click or drag on the wide frame to place the square crop. */
function ImagePicker({
  phrase,
  project,
  onSave,
}: {
  phrase: PhraseView;
  project: ProjectView;
  onSave: (patch: Patch) => Promise<void>;
}) {
  const squareFraction = project.imageArea.height / project.width;
  const crop = effectiveCrop(phrase);
  const [dragCrop, setDragCrop] = useState<number | null>(null);
  const shownCrop = dragCrop ?? crop;
  const positionFromPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const centre = (event.clientX - bounds.left) / bounds.width;
    return Math.min(1, Math.max(0, (centre - squareFraction / 2) / (1 - squareFraction)));
  };
  return (
    <div className="flex flex-col gap-2 rounded-md bg-slate-50 p-2">
      <div
        className="relative w-full cursor-crosshair touch-none select-none"
        style={{ aspectRatio: `${project.width} / ${project.imageArea.height}` }}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragCrop(positionFromPointer(event));
        }}
        onPointerMove={(event) => {
          if (dragCrop !== null) setDragCrop(positionFromPointer(event));
        }}
        onPointerUp={(event) => {
          const position = positionFromPointer(event);
          setDragCrop(null);
          onSave({ crop_x: Math.round(position * 1000) / 1000 });
        }}
      >
        <img
          src={frameUrl(phrase.id, phrase.frame ?? 0)}
          alt=""
          className="absolute inset-0 size-full rounded"
          draggable={false}
        />
        <div
          className="absolute inset-y-0 bg-black/45"
          style={{ left: 0, width: `${shownCrop * (1 - squareFraction) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 bg-black/45"
          style={{ right: 0, width: `${(1 - shownCrop) * (1 - squareFraction) * 100}%` }}
        />
        <div
          className="absolute inset-y-0 border-2 border-white"
          style={{ left: `${shownCrop * (1 - squareFraction) * 100}%`, width: `${squareFraction * 100}%` }}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {phrase.frames.map((frame) => (
          <button
            key={frame.index}
            type="button"
            onClick={() => onSave({ frame: frame.index, crop_x: null })}
            className={cn(
              "overflow-hidden rounded border-2",
              frame.index === (phrase.frame ?? 0) ? "border-sky-500" : "border-transparent",
            )}
            title={`${formatTime(frame.time)} (${frame.time.toFixed(1)}s)`}
          >
            <img src={frameUrl(phrase.id, frame.index)} alt="" className="h-16" />
          </button>
        ))}
        <span className="text-xs text-slate-500">
          Click a frame to use it (resets the crop to auto). Drag on the big frame to move the square.
          {phrase.crop_x !== null && (
            <button type="button" className="ml-2 underline" onClick={() => onSave({ crop_x: null })}>
              Auto crop
            </button>
          )}
        </span>
      </div>
    </div>
  );
}

// Bun's hot reload re-runs this module; reuse the root it created the first time. Bun only allows
// `import.meta.hot.data` written out directly (no optional chaining or aliasing).
const container = document.getElementById("root") as HTMLElement;
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);
if (import.meta.hot) {
  import.meta.hot.data.root ??= createRoot(container);
  (import.meta.hot.data.root as Root).render(app);
} else {
  createRoot(container).render(app);
}
