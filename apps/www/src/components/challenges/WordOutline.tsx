import { LinkIcon, PlayIcon } from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { useAudioSourceNode } from "@/utils/hooks";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { Button } from "../Button";
import { buttonBehaviorClasses } from "../coreClasses";
import { HskBadge } from "../HskBadge";
import type { PhraseDefinition, WordDefinition } from "./challengeServerUtils";

type WordOutlineProps = {
  word: PhraseDefinition | WordDefinition;
};
export function WordOutline({ word }: WordOutlineProps) {
  const { characters: character, meaning: definition, pinyin, audioSrc } = word;
  return (
    <div className="relative flex h-full max-w-full grow flex-col items-stretch justify-stretch overflow-hidden rounded-md border-2 border-black bg-white">
      {word.type === "phrase" && (
        <div className="aspect-square w-full">
          <img src={word.imageSrc} width={500} height={500} aria-label={word.meaning} />
        </div>
      )}
      <div className="border-y-2 first:border-t-0">
        <AudioSection src={audioSrc} />
      </div>
      <div className="flex grow basis-0 flex-col items-start gap-2 p-2">
        <div className="text-3xl md:text-4xl">{character}</div>
        <hr className="w-full border-gray-400" />
        <div className="font-semibold text-xl md:text-2xl">{pinyin}</div>
        <hr className="w-full border-gray-400" />
        <div className="text-pretty text-xl md:text-2xl">{definition}</div>
        {word.type === "word" && word.canonicalWord !== null && (
          <>
            <hr className="w-full border-gray-400" />
            <Link
              href={`/dictionary?search=${encodeURIComponent(word.canonicalWord.characters)}`}
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              <LinkIcon className="h-4 w-4" />
              <span>See: {word.canonicalWord.characters}</span>
            </Link>
          </>
        )}
      </div>
      {/* make sure this is last so it goes on top. */}
      {word.type === "word" && word.hskLevel !== null && (
        <div className="absolute top-1 right-1">
          <HskBadge hskLevel={word.hskLevel} />
        </div>
      )}
    </div>
  );
}

function AudioSection({ src }: { src: string }) {
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  return (
    <div className="grid-stack h-16 w-full">
      <audio ref={audioRef} src={src} crossOrigin="anonymous" className="hidden" />
      <div className="grid-stack-item z-10 self-center justify-self-start pl-1">
        <Button
          className={`${buttonBehaviorClasses} flex items-center gap-4 rounded-lg bg-white/30 p-2 backdrop-blur-sm`}
          aria-label="Play pronunciation"
          onClick={playAudio}
        >
          <PlayIcon className="h-4 w-4" aria-hidden strokeWidth={3} />
        </Button>
      </div>
      <div className="grid-stack-item h-full w-full">
        {audioSourceNode !== null && (
          <LiveAudioVisualizer className="rounded-none border-0" mediaSource={audioSourceNode} width={700} />
        )}
      </div>
    </div>
  );
}
