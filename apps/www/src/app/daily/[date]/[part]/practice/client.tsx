"use client";
import { ArrowRightIcon, FlameIcon, PartyPopperIcon, RotateCcwIcon } from "lucide-react";
import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useParams } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/Button";
import { Challenge } from "@/components/challenges/Challenge";
import { ChallengeTitle } from "@/components/challenges/ChallengeTitle";
import { useDrillContext } from "@/components/challenges/DrillProvider";
import { ExitButton } from "@/components/challenges/ExitButton";
import { useTypingChallenge } from "@/components/challenges/TypingChallengeProvider";
import { useChallengeStream } from "@/components/challenges/useChallengeStream";
import { buttonBehaviorClasses } from "@/components/coreClasses";
import { Kbd } from "@/components/Kbd";
import { type DailyPart, dailyPartInfo, dailyParts } from "@/dailyChallenge/parts";
import { useToday } from "@/dailyChallenge/useToday";
import { cn } from "@/utils/cn";
import { useKeyTrigger } from "@/utils/hooks";
import { Link, useLoadingRouter } from "@/utils/NextNavigationUtils";
import {
  dailyStreak,
  isDailyChallengeComplete,
  useAllDailyChallengeProgress,
  useDailyChallengeProgress,
  useWordIncrementor,
} from "@/utils/playerState";

type Stage = "title" | "running" | "complete";

export function DailyPractice() {
  const { date, part } = useParams<{ date: string; part: DailyPart }>();
  const [progress, completePart] = useDailyChallengeProgress(date);
  const { typingChallenges, multipleChoiceChallenges, sentenceBuildingChallenges } = useTypingChallenge();
  const hasQuestions =
    typingChallenges.length + multipleChoiceChallenges.length + sentenceBuildingChallenges.length > 0;
  const { wordDefinitions, phraseDefinitions } = useDrillContext();
  const [stage, setStage] = useState<Stage>("title");
  const info = dailyPartInfo[part];
  const itemCount = part === "words" ? wordDefinitions.length : phraseDefinitions.length;
  const passLength = itemCount * info.questionsPerItem;

  if (stage === "running")
    return (
      <DailySession
        passLength={passLength}
        passes={info.passes}
        onExit={() => setStage("title")}
        onComplete={() => {
          completePart(part);
          setStage("complete");
        }}
      />
    );
  if (stage === "complete") return <PartComplete date={date} part={part} onAgain={() => setStage("title")} />;
  return (
    <ChallengeTitle
      onStart={() => setStage("running")}
      improve={progress[part] === true}
      disableStart={!hasQuestions}
    >
      <div className="flex flex-col gap-1 text-lg">
        <p className="font-mono text-sm uppercase tracking-widest">
          Part {info.number} of {dailyParts.length}
        </p>
        <p>
          Answer all <span className="font-bold">{passLength * info.passes}</span> questions to finish this
          part.
        </p>
        {info.passes > 1 && (
          <p>
            The first <span className="font-bold">{passLength}</span> go one word at a time. After that, all
            the words are mixed together.
          </p>
        )}
      </div>
    </ChallengeTitle>
  );
}

function DailySession({
  passLength,
  passes,
  onExit,
  onComplete,
}: {
  passLength: number;
  passes: number;
  onExit: () => void;
  onComplete: () => void;
}) {
  const groupedStream = useChallengeStream(true);
  const mixedStream = useChallengeStream(false);
  const wordIncrementor = useWordIncrementor();
  const [answered, setAnswered] = useState(0);
  if (groupedStream.initializing || groupedStream.noProblems) return null;
  if (mixedStream.initializing || mixedStream.noProblems) return null;
  const total = passLength * passes;
  const learning = answered < passLength;
  const { problem, nextProblem } = learning ? groupedStream : mixedStream;
  const onProblemComplete = () => {
    wordIncrementor(problem.wordIds);
    const nextAnswered = answered + 1;
    if (nextAnswered >= total) return onComplete();
    setAnswered(nextAnswered);
    if (!learning) nextProblem();
    else if (nextAnswered < passLength) nextProblem();
    else if (mixedStream.problem.id === problem.id) mixedStream.nextProblem();
  };
  return (
    <div className="relative flex flex-col items-center gap-2">
      <div className="justify-start self-start">
        <ExitButton onExit={onExit} />
      </div>
      <SessionProgress
        sections={
          passes > 1
            ? [
                {
                  label: "Learn",
                  length: passLength,
                  fillClassName: "bg-amber-400",
                  textClassName: "text-amber-600",
                },
                {
                  label: "Mix",
                  length: total - passLength,
                  fillClassName: "bg-green-500",
                  textClassName: "text-green-600",
                },
              ]
            : [{ label: null, length: total, fillClassName: "bg-amber-400", textClassName: "text-amber-600" }]
        }
        answered={answered}
      />
      <div className="flex flex-col items-center self-stretch sm:self-center">
        <AnimatePresence mode="popLayout">
          <Challenge onComplete={onProblemComplete} challenge={problem} active practice key={problem.id} />
        </AnimatePresence>
      </div>
    </div>
  );
}

type ProgressSection = {
  label: string | null;
  length: number;
  fillClassName: string;
  textClassName: string;
};

function SessionProgress({ sections, answered }: { sections: ProgressSection[]; answered: number }) {
  let sectionStart = 0;
  const bounds = sections.map((section) => {
    const start = sectionStart;
    sectionStart += section.length;
    return { ...section, start };
  });
  const current = bounds.find(({ start, length }) => answered < start + length) ?? bounds.at(-1)!;
  return (
    <div className="flex w-full flex-col gap-1">
      <div className="flex items-end justify-between font-mono">
        <span className={cn("font-bold text-lg uppercase", current.textClassName)}>{current.label}</span>
        <span className="text-2xl">
          {answered - current.start}/{current.length}
        </span>
      </div>
      <div className="flex [&>*+*]:border-l-0">
        {bounds.map((section) => {
          const isCurrent = section === current;
          const filled = Math.min(Math.max(answered - section.start, 0), section.length) / section.length;
          return (
            <m.div
              key={section.start}
              className="flex h-4 min-w-8 basis-8 border-2 border-black bg-white"
              animate={{ flexGrow: isCurrent ? 1 : 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <div
                className={cn("h-full transition-[width] duration-300", section.fillClassName)}
                style={{ width: `${filled * 100}%` }}
              />
            </m.div>
          );
        })}
      </div>
    </div>
  );
}

function PartComplete({ date, part, onAgain }: { date: string; part: DailyPart; onAgain: () => void }) {
  const today = useToday();
  const allProgress = useAllDailyChallengeProgress();
  const allDone = isDailyChallengeComplete(allProgress[date]);
  const remainingPart = dailyParts.find((ele) => allProgress[date]?.[ele] !== true);
  const nextHref = remainingPart === undefined ? `/daily/${date}` : `/daily/${date}/${remainingPart}`;
  const streak = today === null ? 0 : dailyStreak(allProgress, today);
  const router = useLoadingRouter();
  useKeyTrigger("Enter", () => router.push(nextHref));

  return (
    <m.div
      className="mx-auto flex w-full flex-col gap-1 lg:max-w-2xl"
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15 }}
    >
      <h1 className="flex items-center gap-3 rounded-t-md bg-black p-3 font-extrabold text-4xl text-white">
        <PartyPopperIcon className="h-9 w-9 shrink-0" />
        {allDone ? "Daily Challenge complete!" : `${dailyPartInfo[part].title} complete!`}
      </h1>
      <div className="flex flex-col gap-2 border-2 border-black bg-white p-4 text-lg">
        {allDone ? (
          <>
            {date === today && streak > 0 && (
              <p className="flex items-center gap-2 font-bold text-2xl">
                <FlameIcon className="h-7 w-7 text-orange-600" />
                {streak}-day streak
              </p>
            )}
            <p>Every part is done for this day. A new set of phrases arrives tomorrow.</p>
          </>
        ) : (
          remainingPart !== undefined && (
            <p>
              Next up: <span className="font-bold">{dailyPartInfo[remainingPart].title}</span>.
            </p>
          )
        )}
      </div>
      <div className="flex gap-1">
        <Button
          onClick={onAgain}
          className="flex items-center justify-center gap-2 rounded-none rounded-bl-md bg-white px-4 py-2"
        >
          <RotateCcwIcon className="h-5 w-5" />
          Again
        </Button>
        <Link
          href={nextHref}
          className={cn(
            buttonBehaviorClasses,
            "flex grow basis-0 items-center justify-center gap-2 rounded-br-md px-4 py-2 font-bold text-xl",
          )}
        >
          <Kbd>↵</Kbd>
          <span>
            {remainingPart === undefined
              ? "Back to Daily Challenge"
              : `Continue to ${dailyPartInfo[remainingPart].title}`}
          </span>
          <ArrowRightIcon />
        </Link>
      </div>
    </m.div>
  );
}
