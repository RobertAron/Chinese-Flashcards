import { PlayIcon } from "lucide-react";
import { useRef } from "react";
import { useAudioSourceNode } from "@/utils/hooks";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { buttonBehaviorClasses } from "../coreClasses";
import { HskBadge } from "../HskBadge";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";

type WordOutlineProps = {
  word: PhraseDefinition | WordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { characters: character, meaning: definition, pinyin, emojiChallenge: emoji, audioSrc } = word;
  return (
    <div className="relative flex h-full max-w-full grow flex-row items-stretch justify-stretch gap-2 overflow-hidden rounded-md border-2 border-black bg-white">
      {word.type === "word" && word.hskLevel !== null && (
        <div className="absolute top-2 right-2">
          <HskBadge hskLevel={word.hskLevel} />
        </div>
      )}
      <AudioSection src={audioSrc} />
      <div className="flex grow basis-0 flex-col items-start gap-2 p-2">
        <div className="flex flex-col">
          <div className="text-4xl md:text-6xl">{character}</div>
          <div className="font-semibold text-xl md:text-2xl">{pinyin}</div>
        </div>
        <hr className="w-full border-gray-400" />
        <div className="text-pretty text-xl md:text-2xl">{definition}</div>
        <div className="text-pretty text-xl md:text-2xl">{emoji}</div>
      </div>
    </div>
  );
}

function AudioSection({ src }: { src: string }) {
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="grid-stack aspect-square h-full shrink-0">
      <audio ref={audioRef} src={src} crossOrigin="anonymous" className="hidden" />
      <div className="grid-stack-item z-10 mt-1 ml-1 self-start justify-self-start">
        <button
          type="button"
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          aria-label="Play pronunciation"
          onClick={playAudio}
        >
          <PlayIcon className="h-4 w-4" aria-hidden strokeWidth={3} />
        </button>
      </div>
      <div className="grid-stack-item h-full min-h-24 w-full">
        {audioSourceNode !== null && (
          <LiveAudioVisualizer
            className="rounded-none border-0 border-r-2"
            mediaSource={audioSourceNode}
            width={700}
          />
        )}
      </div>
    </div>
  );
}
