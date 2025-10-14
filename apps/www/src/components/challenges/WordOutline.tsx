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
    <div className="relative flex h-full max-w-full grow flex-col items-stretch justify-stretch overflow-hidden rounded-md border-2 border-black bg-white">
      {word.type === "phrase" && (
        <div className="aspect-square w-full">
          <img src={word.imageSrc} width={500} height={500} aria-label={word.meaning} />
        </div>
      )}
      {word.type === "word" && word.hskLevel !== null && (
        <div className="absolute top-2 right-2">
          <HskBadge hskLevel={word.hskLevel} />
        </div>
      )}
      <AudioSection src={audioSrc} />
      <div className="flex grow basis-0 flex-col items-start gap-2 p-2">
        <div className="text-3xl md:text-4xl">{character}</div>
        <hr className="w-full border-gray-400" />
        <div className="font-semibold text-xl md:text-2xl">{pinyin}</div>
        <hr className="w-full border-gray-400" />
        <div className="text-pretty text-xl md:text-2xl">{definition}</div>
      </div>
    </div>
  );
}

function AudioSection({ src }: { src: string }) {
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="grid-stack h-16 w-full">
      <audio ref={audioRef} src={src} crossOrigin="anonymous" className="hidden" />
      <div className="grid-stack-item z-10 mt-1 ml-1 self-center justify-self-start">
        <button
          type="button"
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          aria-label="Play pronunciation"
          onClick={playAudio}
        >
          <PlayIcon className="h-4 w-4" aria-hidden strokeWidth={3} />
        </button>
      </div>
      <div className="grid-stack-item h-full w-full">
        {audioSourceNode !== null && (
          <LiveAudioVisualizer
            className="rounded-none border-0 border-y-2"
            mediaSource={audioSourceNode}
            width={700}
          />
        )}
      </div>
    </div>
  );
}
