"use client";
import { useAudioSourceNode, useKeyTrigger } from "@/utils/hooks";
import { RotateCcw } from "lucide-react";
import { type Ref, useEffect, useRef } from "react";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { Kbd } from "../Kbd";
import { ChallengeWrapper, WordProgress } from "./utils";

type AudioChallengeProps = {
  pinyin: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  fileName: string;
  ref?: Ref<HTMLDivElement>;
};

export function AudioChallenge({
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
  fileName,
}: AudioChallengeProps) {
  const url = encodeURI(`/assets/single-word-audio/${fileName}`);
  const audioRef = useRef<HTMLMediaElement>(null!);
  const { audioSourceNode, playAudio } = useAudioSourceNode(audioRef);
  useEffect(() => {
    audioRef.current.playbackRate = practice ? 0.7 : 1;
  }, [practice]);
  useKeyTrigger("Enter", playAudio);
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <audio ref={audioRef} src={url} autoPlay />
      <div className="h-36 w-full grid-stack">
        <div className="z-10 ml-1 mt-1 self-start justify-self-start grid-stack-item">
          <button
            type="button"
            className="group flex items-center gap-4 rounded-lg border-[0.5px] border-black bg-white/30 p-2 text-sm backdrop-blur-sm hocus:border-slate-300 hocus:bg-black hocus:text-white"
            onClick={playAudio}
          >
            <RotateCcw className="h-4 w-4" />
            <div className="flex gap-1">
              <Kbd>⌘</Kbd>
              <Kbd>↵</Kbd>
            </div>
          </button>
        </div>
        <div className="h-full w-full grid-stack-item">
          {audioSourceNode !== null && <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />}
        </div>
      </div>
      <WordProgress pinyin={pinyin} active={active} practice={practice} onComplete={onComplete} />
    </ChallengeWrapper>
  );
}
