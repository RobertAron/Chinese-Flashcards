import { createSingletonGetter } from "./singletonGenerator";

export const getAudioContext = createSingletonGetter(() => new AudioContext());
