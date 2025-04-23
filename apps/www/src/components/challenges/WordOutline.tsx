import { useAudioSourceNode } from "@/utils/hooks";
import { PlayIcon } from "lucide-react";
import { useRef } from "react";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { buttonBehaviorClasses } from "../coreClasses";
import type { PhraseOrWordDefinition } from "./TypingChallengeProvider";

type WordOutlineProps = {
  word: PhraseOrWordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { characters: character, meaning: definition, pinyin, emojiChallenge: emoji, audioSrc } = word;
  return (
    <div className="flex h-full items-stretch justify-stretch gap-2 rounded-md border-2 border-black bg-white p-2">
      <div className="flex flex-grow basis-0 flex-col items-start gap-2">
        <div className="text-6xl">{character}</div>
        <div className="font-semibold text-2xl">{pinyin}</div>
        <div className="text-pretty text-sm">{definition}</div>
        <div className="text-pretty text-sm">{emoji}</div>
      </div>
      <AudioSection src={audioSrc} />
    </div>
  );
}

function AudioSection({ src }: { src: string }) {
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="grid-stack h-full w-full flex-shrink-0 flex-grow basis-0">
      <audio ref={audioRef} src={src} crossOrigin="anonymous" className="hidden" />
      <div className="grid-stack-item z-10 mt-1 ml-1 self-start justify-self-start">
        <button
          type="button"
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          onClick={playAudio}
        >
          <PlayIcon className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
      <div className="grid-stack-item h-full w-full">
        {audioSourceNode !== null && <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />}
      </div>
    </div>
  );
}
