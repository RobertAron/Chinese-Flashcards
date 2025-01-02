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
  return (
    <ChallengeWrapper id={id} active={active} ref={ref}>
      {audioSourceNode !== null && (
        <LiveAudioVisualizer mediaSource={audioSourceNode} width={700} />
      )}
      <div className="text-pretty text-center text-sm">{definition}</div>
      <audio ref={audioRef} src={url} autoPlay  />
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
