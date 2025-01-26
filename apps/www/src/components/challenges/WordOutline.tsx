import { useAudioSourceNode } from "@/utils/hooks";
import type { WordDefinition } from "common-data/types";
import { PlayIcon } from "lucide-react";
import { useRef } from "react";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { buttonBehaviorClasses } from "../coreClasses";

type WordOutlineProps = {
  word: WordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { character, definition, pinyin, emoji, fileName } = word;
  return (
    <div className="flex h-full items-stretch justify-stretch gap-2 rounded-md border-2 border-black bg-white p-2">
      <div className="flex flex-grow basis-0 flex-col items-start gap-2">
        <div className="text-6xl">{character}</div>
        <div className="text-2xl font-semibold">{pinyin}</div>
        <div className="text-pretty text-sm">{definition}</div>
        <div className="text-pretty text-sm">{emoji}</div>
      </div>
      <AudioSection fileName={fileName} />
    </div>
  );
}

function AudioSection({ fileName }: { fileName: string }) {
  const url = encodeURI(`/assets/single-word-audio/${fileName}`);
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="h-full w-full flex-shrink-0 flex-grow basis-0 grid-stack">
      <audio ref={audioRef} src={url} className="hidden" />
      <div className="z-10 ml-1 mt-1 self-start justify-self-start grid-stack-item">
        <button
          type="button"
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          onClick={playAudio}
        >
          <PlayIcon className="h-4 w-4" strokeWidth={3} />
        </button>
      </div>
      <div className="h-full w-full grid-stack-item">
        {audioSourceNode !== null && <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />}
      </div>
    </div>
  );
}
