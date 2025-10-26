"use client";
import { useCallback, useEffect, useState } from "react";
import { getAudioContext } from "./audioContext";

// Key Trigger
export function useKeyTrigger(
  key: string,
  cb: (e: KeyboardEvent) => void,
  {
    alt = false,
    ctrl = false,
    meta = false,
    shift = false,
  }: {
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
  } = {},
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      console.log(event.key)
      const keyMatch = event.key === key;
      const matchesModifiers =
        event.altKey === alt && event.ctrlKey === ctrl && event.metaKey === meta && event.shiftKey === shift;
      if (keyMatch && matchesModifiers) {
        cb(event);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cb, key, alt, ctrl, meta, shift]);
}

// use audio source
const mediaElementSources = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
function getOrCreateMediaElementSource(audioContext: AudioContext, el: HTMLMediaElement) {
  const node = mediaElementSources.get(el);
  if (node !== undefined) return node;
  const generatedNode = audioContext.createMediaElementSource(el);
  mediaElementSources.set(el, generatedNode);
  return generatedNode;
}
export function useAudioSourceNode(mediaElementRef: { current: HTMLMediaElement }) {
  const [audioSourceNode, setAudioSourceNode] = useState<MediaElementAudioSourceNode | null>(null);
  useEffect(() => {
    const audioContext = getAudioContext();
    const sourceNode = getOrCreateMediaElementSource(audioContext, mediaElementRef.current);
    sourceNode.connect(audioContext.destination);
    setAudioSourceNode(sourceNode);
    return () => {
      sourceNode.disconnect();
    };
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
