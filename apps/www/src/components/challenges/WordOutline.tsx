import { PlayIcon } from "lucide-react";
import { useRef } from "react";
import { useAudioSourceNode } from "@/utils/hooks";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { buttonBehaviorClasses } from "../coreClasses";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";

type WordOutlineProps = {
  word: PhraseDefinition | WordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { characters: character, meaning: definition, pinyin, emojiChallenge: emoji, audioSrc } = word;
  return (
    <div className="flex flex-row items-stretch h-full max-w-full overflow-hidden bg-white border-2 border-black grow justify-stretch gap-2 rounded-md">
      <AudioSection src={audioSrc} />
      <div className="flex flex-col items-start p-2 grow basis-0 gap-2">
        <div className="flex flex-col">
          <div className="text-4xl md:text-6xl">{character}</div>
          <div className="text-xl font-semibold md:text-2xl">{pinyin}</div>
        </div>
        <hr className="w-full border-gray-400" />
        <div className="text-xl text-pretty md:text-2xl">{definition}</div>
        <div className="text-xl text-pretty md:text-2xl">{emoji}</div>
      </div>
    </div>
  );
}

function AudioSection({ src }: { src: string }) {
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="h-full grid-stack aspect-square shrink-0">
      <audio ref={audioRef} src={src} crossOrigin="anonymous" className="hidden" />
      <div className="z-10 self-start mt-1 ml-1 grid-stack-item justify-self-start">
        <button
          type="button"
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          aria-label="Play pronunciation"
          onClick={playAudio}
        >
          <PlayIcon className="w-4 h-4" aria-hidden strokeWidth={3} />
        </button>
      </div>
      <div className="w-full h-full grid-stack-item min-h-24">
        {audioSourceNode !== null && (
          <LiveAudioVisualizer
            className="border-0 border-r-2 rounded-none"
            mediaSource={audioSourceNode}
            width={700}
          />
        )}
      </div>
    </div>
  );
}
