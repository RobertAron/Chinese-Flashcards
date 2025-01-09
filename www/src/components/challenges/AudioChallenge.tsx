"use client";
import {
  Ref,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { getAudioContext } from "@/utils/audioContext";
import { ChallengeWrapper, WordProgress } from "./utils";
import { RotateCcw } from "lucide-react";
import { Kbd } from "../Kbd";

type PinyinChallengeProps = {
  pinyin: string;
  id: string;
  onComplete?: () => void;
  active?: boolean;
  practice?: boolean;
  display?: boolean;
  ref?: Ref<HTMLDivElement>;
};

export function AudioChallenge({
  pinyin,
  onComplete,
  active,
  practice,
  id,
  ref,
  display,
}: PinyinChallengeProps) {
  const url = encodeURI(`/assets/single-word-audio/${pinyin}.mp3`);
  const audioRef = useRef<HTMLMediaElement>(null!);
  const [audioSourceNode, setAudioSourceNode] =
    useState<MediaElementAudioSourceNode | null>(null);
  useLayoutEffect(() => {
    const audioContext = getAudioContext();
    const sourceNode = audioContext.createMediaElementSource(audioRef.current);
    sourceNode.connect(audioContext.destination);
    setAudioSourceNode(sourceNode);
  }, []);
  useEffect(() => {
    audioRef.current.playbackRate = practice ? 0.7 : 1;
  }, [practice]);
  const playAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0; // Reset playback
      audioRef.current.play(); // Replay audio
    }
  }, []);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "Enter")
        playAudio();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioRef, playAudio]);
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <audio ref={audioRef} src={url} autoPlay />
      {!display && (
        <div className="h-36 w-full grid-stack">
          <div className="z-10 ml-1 mt-1 self-start justify-self-start grid-stack-item">
            <button
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
            {audioSourceNode !== null && (
              <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />
            )}
          </div>
        </div>
      )}
      <WordProgress
        pinyin={pinyin}
        active={active}
        display={display}
        practice={practice}
        onComplete={onComplete}
      />
    </ChallengeWrapper>
  );
}
