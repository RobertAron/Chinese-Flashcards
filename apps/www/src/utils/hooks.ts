"use client";
import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { getAudioContext } from "./audioContext";


export function useKeyTrigger(key: string, cb: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === key) cb(event);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cb, key]);
}

export function useAudioSourceNode(mediaElementRef: {
  current: HTMLMediaElement;
}) {
  const [audioSourceNode, setAudioSourceNode] = useState<MediaElementAudioSourceNode | null>(null);
  useLayoutEffect(() => {
    const audioContext = getAudioContext();
    const sourceNode = audioContext.createMediaElementSource(mediaElementRef.current);
    sourceNode.connect(audioContext.destination);
    setAudioSourceNode(sourceNode);
  }, [mediaElementRef]);
  const playAudio = useCallback(() => {
    mediaElementRef.current.currentTime = 0; // Reset playback
    mediaElementRef.current.play(); // Replay audio
  }, [mediaElementRef]);
  return {
    audioSourceNode,
    playAudio,
  };
}
