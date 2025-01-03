"use client";
import { Ref, useEffect, useRef, useState } from "react";
import { LiveAudioVisualizer } from "../AudioVisualizer";
import { getAudioContext } from "@/utils/audioContext";
import { ChallengeWrapper, useTypeMatchProgress, WordProgress } from "./utils";

type PinyinChallengeProps = {
  pinyin: string;
  definition: string;
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
  definition,
  display,
}: PinyinChallengeProps) {
  const progress = useTypeMatchProgress(pinyin, active, onComplete);
  const url = encodeURI(`/assets/single-word-audio/${pinyin}.mp3`);
  const audioRef = useRef<HTMLMediaElement>(null!);
  const [audioSourceNode, setAudioSourceNode] =
    useState<MediaElementAudioSourceNode | null>(null);
  useEffect(() => {
    const audioContext = getAudioContext();
    const sourceNode = audioContext.createMediaElementSource(audioRef.current);
    sourceNode.connect(audioContext.destination);
    setAudioSourceNode(sourceNode);
  }, []);
  useEffect(() => {
    audioRef.current.playbackRate = practice ? 0.7 : 1;
  }, [practice]);
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      <audio ref={audioRef} src={url} autoPlay />
      {!display && (
        <div className="h-32 w-full">
          {audioSourceNode !== null && (
            <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />
          )}
        </div>
      )}
      <div className="text-pretty text-center text-sm">{definition}</div>
      <WordProgress
        progress={progress}
        pinyin={pinyin}
        active={active}
        display={display}
        practice={practice}
      />
    </ChallengeWrapper>
  );
}
