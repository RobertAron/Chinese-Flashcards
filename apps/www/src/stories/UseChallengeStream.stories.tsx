"use client";
import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { PlayerProvider } from "@/utils/playerState";
import { DrillProvider } from "@/components/challenges/DrillProvider";
import { TypingChallengeProvider } from "@/components/challenges/TypingChallengeProvider";
import { useChallengeStream } from "@/app/courses/[courseSlug]/[lessonSlug]/[drillSlug]/useChallengeStream";
import type { WordDefinition, PhraseDefinition } from "@/components/challenges/challengeServerUtils";

const mockWords: WordDefinition[] = [
  {
    id: 1,
    type: "word",
    characters: "你好",
    pinyin: "nǐ hǎo",
    meaning: "hello",
    audioSrc: "/audio/placeholder.mp3",
    emojiChallenge: null,
    hskLevel: 1,
    canonicalWord: null,
  },
  {
    id: 2,
    type: "word",
    characters: "谢谢",
    pinyin: "xiè xiè",
    meaning: "thank you",
    audioSrc: "/audio/placeholder.mp3",
    emojiChallenge: null,
    hskLevel: 1,
    canonicalWord: null,
  },
  {
    id: 3,
    type: "word",
    characters: "再见",
    pinyin: "zài jiàn",
    meaning: "goodbye",
    audioSrc: "/audio/placeholder.mp3",
    emojiChallenge: null,
    hskLevel: 1,
    canonicalWord: null,
  },
  {
    id: 4,
    type: "word",
    characters: "早上好",
    pinyin: "zǎo shàng hǎo",
    meaning: "good morning",
    audioSrc: "/audio/placeholder.mp3",
    emojiChallenge: null,
    hskLevel: 1,
    canonicalWord: null,
  },
];

const mockPhrases: PhraseDefinition[] = [
  {
    id: 100,
    type: "phrase",
    characters: "你好吗",
    pinyin: "nǐ hǎo ma",
    meaning: "how are you",
    audioSrc: "/audio/placeholder.mp3",
    emojiChallenge: null,
    imageSrc: "/images/placeholder.png",
    words: [
      { id: 1, characters: "你好", pinyin: "nǐ hǎo", meaning: "hello", hskLevel: 1, canonicalWord: null },
      { id: 5, characters: "吗", pinyin: "ma", meaning: "question particle", hskLevel: 1, canonicalWord: null },
    ],
  },
];

function ChallengeStreamDisplay({ beginnerMode }: { beginnerMode: boolean }) {
  const result = useChallengeStream(beginnerMode);
  const [history, setHistory] = useState<string[]>([]);

  if ("initializing" in result && result.initializing) {
    return <div className="p-4 text-yellow-600">Initializing...</div>;
  }
  if ("noProblems" in result && result.noProblems) {
    return <div className="p-4 text-red-600">No problems available</div>;
  }

  const { problem, nextProblem } = result;

  return (
    <div className="p-4 space-y-4">
      <div className="border rounded p-3 bg-gray-50">
        <div className="text-sm text-gray-500">Current Problem</div>
        <div className="font-mono text-sm mt-1">
          <div>Type: <span className="font-bold">{problem.type}</span></div>
          <div>ID: {problem.id}</div>
          <div>Word IDs: [{problem.wordIds.join(", ")}]</div>
          {"pinyin" in problem && <div>Pinyin: {problem.pinyin}</div>}
          {"definition" in problem && <div>Definition: {problem.definition}</div>}
          {"questionText" in problem && <div>Question: {problem.questionText}</div>}
          {"englishTranslation" in problem && <div>English: {problem.englishTranslation}</div>}
        </div>
      </div>

      <button
        type="button"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => {
          setHistory((h) => [...h, `${problem.type} (${problem.id})`]);
          nextProblem();
        }}
      >
        Next Problem
      </button>

      {history.length > 0 && (
        <div className="border rounded p-3 bg-gray-50 max-h-48 overflow-y-auto">
          <div className="text-sm text-gray-500 mb-1">History ({history.length})</div>
          {history.map((entry, i) => (
            <div key={`${entry}-${i}`} className="text-xs font-mono">{i + 1}. {entry}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function Wrapper() {
  const [beginnerMode, setBeginnerMode] = useState(true);
  const [renderKey, setRenderKey] = useState(0);

  return (
    <PlayerProvider>
      <DrillProvider
        courseSlug="test-course"
        lessonSlug="test-lesson"
        drillSlug="test-drill"
        drillTitle="Test Drill"
        description={null}
        words={mockWords}
        phrases={mockPhrases}
      >
        <TypingChallengeProvider>
          <div className="max-w-lg mx-auto p-4 space-y-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={beginnerMode}
                  onChange={(e) => setBeginnerMode(e.target.checked)}
                />
                Beginner Mode
              </label>
              <button
                type="button"
                className="px-3 py-1 bg-gray-200 rounded text-sm"
                onClick={() => setRenderKey((k) => k + 1)}
              >
                Force Remount
              </button>
              <span className="text-sm text-gray-500">
                Mode: {beginnerMode ? "Beginner (grouped)" : "Normal (shuffled)"}
              </span>
            </div>

            <ChallengeStreamDisplay key={renderKey} beginnerMode={beginnerMode} />
          </div>
        </TypingChallengeProvider>
      </DrillProvider>
    </PlayerProvider>
  );
}

const meta = {
  title: "Hooks/UseChallengeStream",
  component: Wrapper,
} satisfies Meta<typeof Wrapper>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
