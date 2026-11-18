"use client";
import { PauseIcon, PlayIcon, RotateCcwIcon, ScissorsIcon, Trash2Icon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import z from "zod";
import { Button } from "@/components/Button";
import { phraseToAudioSource, phraseToImageSource } from "@/utils/idToAudioSource";
import { useDeletePhrase, useResetPhraseAudio, useTrimPhraseAudio } from "./api/[[...route]]/client";
import type { ReviewLessons } from "./page.dev";

type ReviewPhrase = ReviewLessons[number]["Drill"][number]["Phrases"][number];
const lessonStorageKey = "xiaohei-review-lesson";

export function PhraseReview({ lessons }: { lessons: ReviewLessons }) {
  const [lessonSlug, setLessonSlug] = useState(lessons[0]?.slug ?? "");
  const [deletedIds, setDeletedIds] = useState<ReadonlySet<number>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(lessonStorageKey);
      if (saved !== null && lessons.some((lesson) => lesson.slug === saved)) setLessonSlug(saved);
    } catch {}
  }, [lessons]);

  const chooseLesson = (slug: string) => {
    setLessonSlug(slug);
    try {
      localStorage.setItem(lessonStorageKey, slug);
    } catch {}
    window.scrollTo({ top: 0 });
  };

  const lessonIndex = lessons.findIndex((lesson) => lesson.slug === lessonSlug);
  const lesson = lessons[lessonIndex];
  const nextLesson = lessons[lessonIndex + 1];
  const countPhrases = (drills: ReviewLessons[number]["Drill"]) =>
    drills.flatMap((drill) => drill.Phrases).filter((phrase) => !deletedIds.has(phrase.id)).length;

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-2">
        <span>Lesson</span>
        <select
          className="rounded-sm border border-black bg-white p-1"
          value={lessonSlug}
          onChange={(event) => chooseLesson(event.target.value)}
        >
          {Object.entries(Object.groupBy(lessons, (option) => option.Course.title)).map(
            ([course, options]) => (
              <optgroup key={course} label={course}>
                {options?.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.title} ({countPhrases(option.Drill)})
                  </option>
                ))}
              </optgroup>
            ),
          )}
        </select>
      </label>
      {lesson?.Drill.map((drill) => (
        <section key={drill.slug} className="flex flex-col gap-2">
          <h2 className="text-2xl font-semibold">{drill.title}</h2>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {drill.Phrases.filter((phrase) => !deletedIds.has(phrase.id)).map((phrase) => (
              <PhraseCard
                key={phrase.id}
                phrase={phrase}
                onDeleted={() => setDeletedIds((current) => new Set(current).add(phrase.id))}
              />
            ))}
          </div>
        </section>
      ))}
      {nextLesson && (
        <Button className="self-start" onClick={() => chooseLesson(nextLesson.slug)}>
          Next: {nextLesson.title}
        </Button>
      )}
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
// Inputs hold raw text while typing; this parses them only when an action needs the numbers.
const trimRange = (duration: number) =>
  z
    .object({ start: seconds("Start"), end: seconds("End") })
    .refine(({ start, end }) => end > start, "End must be after start")
    .refine(({ end }) => end <= duration + 0.01, `End can't be past ${duration.toFixed(2)}s`);

function PhraseCard({ phrase, onDeleted }: { phrase: ReviewPhrase; onDeleted: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [version, setVersion] = useState(0);
  const [duration, setDuration] = useState(0);
  const [start, setStart] = useState("0");
  const [end, setEnd] = useState("0");
  const [stopAt, setStopAt] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trigger: deletePhrase, isMutating: isDeleting } = useDeletePhrase();
  const { trigger: trimAudio, isMutating: isTrimming } = useTrimPhraseAudio();
  const { trigger: resetAudio, isMutating: isResetting } = useResetPhraseAudio();

  const text = phrase.PhraseWords.map(({ word }) => word.characters).join("");
  const audioSource = `${phraseToAudioSource(phrase.id)}${version === 0 ? "" : `?v=${version}`}`;
  const isBusy = isDeleting || isTrimming || isResetting;

  const playRange = (from: number, to: number | null) => {
    const audio = audioRef.current;
    if (audio === null) return;
    audio.currentTime = from;
    setStopAt(to);
    void audio.play();
  };
  // Returns the parsed range, or shows why it's invalid.
  const parseRange = () => {
    const parsed = trimRange(duration).safeParse({ start, end });
    if (parsed.success) return parsed.data;
    setError(parsed.error.issues[0]?.message ?? "Invalid trim range");
    return null;
  };
  const run = async (action: () => Promise<unknown>) => {
    setError(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : String(caught));
    }
  };
  const applyDuration = (audio: HTMLAudioElement) => {
    if (!Number.isFinite(audio.duration)) return;
    const length = roundTime(audio.duration);
    setDuration(length);
    setStart("0");
    setEnd(`${length}`);
  };
  // Metadata can load before hydration attaches onLoadedMetadata.
  // biome-ignore lint/correctness/useExhaustiveDependencies: re-read whenever the source changes
  useEffect(() => {
    if (audioRef.current !== null && audioRef.current.readyState >= 1) applyDuration(audioRef.current);
  }, [audioSource]);
  const reloadAudio = () => {
    setDuration(0);
    setVersion(Date.now());
  };

  return (
    <article className="flex flex-col gap-2 rounded-sm border border-black bg-white p-2 shadow-md">
      <div className="flex gap-3">
        <img
          src={phraseToImageSource(phrase.id)}
          alt=""
          width={128}
          height={128}
          loading="lazy"
          className="size-32 shrink-0 rounded-md bg-slate-200 object-cover"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-2xl">{text}</p>
          <p className="text-slate-700">{phrase.meaning}</p>
          <p className="text-xs text-slate-400">#{phrase.id}</p>
        </div>
      </div>
      <audio
        ref={audioRef}
        key={audioSource}
        src={audioSource}
        controls
        preload="metadata"
        className="w-full"
        onLoadedMetadata={(event) => applyDuration(event.currentTarget)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => {
          setIsPlaying(false);
          setStopAt(null);
        }}
        onTimeUpdate={(event) => {
          if (stopAt !== null && event.currentTarget.currentTime >= stopAt) event.currentTarget.pause();
        }}
      />
      <div className="flex flex-wrap items-end gap-2">
        <TimeInput
          label="Start"
          value={start}
          onChange={setStart}
          onUseCurrent={() => setStart(`${roundTime(audioRef.current?.currentTime ?? 0)}`)}
        />
        <TimeInput
          label="End"
          value={end}
          onChange={setEnd}
          onUseCurrent={() => setEnd(`${roundTime(audioRef.current?.currentTime ?? duration)}`)}
        />
        <span className="pb-1 text-sm text-slate-500">of {duration.toFixed(2)}s</span>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          className="flex items-center gap-1"
          onClick={() => {
            if (isPlaying) return audioRef.current?.pause();
            setError(null);
            const range = parseRange();
            if (range !== null) playRange(range.start, range.end);
          }}
        >
          {isPlaying ? <PauseIcon size={16} /> : <PlayIcon size={16} />}
          Preview trim
        </Button>
        <Button
          className="flex items-center gap-1"
          isDisabled={duration === 0 || isBusy}
          onClick={() => {
            setError(null);
            const range = parseRange();
            if (range === null) return;
            if (range.start < 0.01 && range.end > duration - 0.01) return setError("Nothing to trim");
            void run(async () => {
              await trimAudio({ id: phrase.id, ...range });
              reloadAudio();
            });
          }}
        >
          <ScissorsIcon size={16} />
          {isTrimming ? "Trimming…" : "Save trim"}
        </Button>
        <Button
          className="flex items-center gap-1"
          isDisabled={isBusy}
          onClick={() =>
            run(async () => {
              await resetAudio(phrase.id);
              reloadAudio();
            })
          }
        >
          <RotateCcwIcon size={16} />
          {isResetting ? "Restoring…" : "Restore original"}
        </Button>
        <Button
          className="ml-auto flex items-center gap-1 text-red-700"
          isDisabled={isBusy}
          onBlur={() => setConfirmingDelete(false)}
          onClick={() => {
            if (!confirmingDelete) return setConfirmingDelete(true);
            void run(async () => {
              await deletePhrase(phrase.id);
              onDeleted();
            });
          }}
        >
          <Trash2Icon size={16} />
          {isDeleting ? "Deleting…" : confirmingDelete ? "Click again to delete" : "Delete"}
        </Button>
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </article>
  );
}

function TimeInput({
  label,
  value,
  onChange,
  onUseCurrent,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onUseCurrent: () => void;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm text-slate-800">{label} (s)</span>
      <div className="flex gap-1">
        <input
          type="text"
          inputMode="decimal"
          aria-label={`${label} in seconds`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-20 rounded-sm border border-slate-400 px-1"
        />
        <Button className="px-2 text-sm" onClick={onUseCurrent}>
          Set to playhead
        </Button>
      </div>
    </div>
  );
}
