"use client";
// https://github.com/samhirtarif/react-audio-visualize
import { getAudioContext } from "@/utils/audioContext";
import { useCallback, useEffect, useRef, useState } from "react";

export const calculateBarData = (
  frequencyData: Uint8Array,
  desiredBars = 100,
): number[] => {
  const usefulDataPoints = frequencyData.slice(
    Math.floor(20 * 0.02),
    Math.floor(frequencyData.length * 0.6),
  );
  const results = new Array(desiredBars).fill(0);
  const highestBase2 = Math.log2(usefulDataPoints.length);
  const scaling = desiredBars / highestBase2;
  for (let i = 0; i < usefulDataPoints.length; ++i) {
    const targetBar = Math.floor(Math.log2(i) * scaling);
    results[targetBar] += usefulDataPoints[i]! / (i + 1);
  }
  return results;
};

export const draw = (
  data: number[],
  canvas: HTMLCanvasElement,
  barWidth: number,
  gap: number,
  backgroundColor: string,
  barColor: string,
): void => {
  const yCenter = canvas.height / 2;

  const ctx = canvas.getContext("2d")!;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  data.forEach((dp, i) => {
    ctx.fillStyle = barColor;
    let dataPointAmp = dp * 6;

    const x = i * (barWidth + gap);
    const y = yCenter - dataPointAmp / 2;
    const w = barWidth;
    const h = dataPointAmp;

    ctx.beginPath();
    if (ctx.roundRect) {
      // making sure roundRect is supported by the browser
      ctx.roundRect(x, y, w, h, 50);
      ctx.fill();
    } else {
      // fallback for browsers that do not support roundRect
      ctx.fillRect(x, y, w, h);
    }
  });
};

export type Props = {
  /**
   * Media recorder who's stream needs to visualized
   */
  mediaSource: MediaElementAudioSourceNode;
  /**
   * Width of the visualization. Default" "100%"
   */
  width?: number | string;
  /**
   * Height of the visualization. Default" "100%"
   */
  height?: number | string;
  /**
   * Width of each individual bar in the visualization. Default: `2`
   */
  barWidth?: number;
  /**
   * Gap between each bar in the visualization. Default `1`
   */
  gap?: number;
  /**
   * BackgroundColor for the visualization: Default `transparent`
   */
  backgroundColor?: string;
  /**
   *  Color of the bars drawn in the visualization. Default: `"rgb(160, 198, 255)"`
   */
  barColor?: string;
  /**
   * An unsigned integer, representing the window size of the FFT, given in number of samples.
   * A higher value will result in more details in the frequency domain but fewer details in the amplitude domain.
   * For more details {@link https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/fftSize MDN AnalyserNode: fftSize property}
   * Default: `1024`
   */
  fftSize?:
    | 32
    | 64
    | 128
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 32768;
  /**
   * A double, representing the maximum decibel value for scaling the FFT analysis data
   * For more details {@link https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/maxDecibels MDN AnalyserNode: maxDecibels property}
   * Default: `-10`
   */
  maxDecibels?: number;
  /**
   * A double, representing the minimum decibel value for scaling the FFT analysis data, where 0 dB is the loudest possible sound
   * For more details {@link https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/minDecibels MDN AnalyserNode: minDecibels property}
   * Default: `-90`
   */
  minDecibels?: number;
  /**
   * A double within the range 0 to 1 (0 meaning no time averaging). The default value is 0.8.
   * If 0 is set, there is no averaging done, whereas a value of 1 means "overlap the previous and current buffer quite a lot while computing the value",
   * which essentially smooths the changes across
   * For more details {@link https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/smoothingTimeConstant MDN AnalyserNode: smoothingTimeConstant property}
   * Default: `0.4`
   */
  smoothingTimeConstant?: number;
};

// const audioElement = document.querySelector('audio'); // Your <audio> element
// const audioContext = new AudioContext();

// // Create a MediaElementAudioSourceNode
// const sourceNode = audioContext.createMediaElementSource(audioElement);

const LiveAudioVisualizer = ({
  mediaSource: mediaSource,
  width = "100%",
  height = "100%",
  barWidth = 2,
  gap = 1,
  backgroundColor = "transparent",
  barColor = "rgb(160, 198, 255)",
  fftSize = 1024,
  maxDecibels = -10,
  minDecibels = -90,
  smoothingTimeConstant = 0.4,
}: Props) => {
  const [analyserResources, setAnalyserResources] = useState<{
    analyser: AnalyserNode;
    dataTarget: Uint8Array;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const analyser = getAudioContext().createAnalyser();
    analyser.fftSize = fftSize;
    analyser.minDecibels = minDecibels;
    analyser.maxDecibels = maxDecibels;
    analyser.smoothingTimeConstant = smoothingTimeConstant;
    const data = new Uint8Array(analyser.frequencyBinCount);
    setAnalyserResources({
      analyser: analyser,
      dataTarget: data,
    });
    mediaSource.connect(analyser);
    return () => analyser.disconnect();
  }, [fftSize, maxDecibels, mediaSource, minDecibels, smoothingTimeConstant]);

  const processFrequencyData = useCallback(
    (data: Uint8Array): void => {
      if (!canvasRef.current) return;
      const dataPoints = calculateBarData(data);
      draw(
        dataPoints,
        canvasRef.current,
        barWidth,
        gap,
        backgroundColor,
        barColor,
      );
    },
    [backgroundColor, barColor, barWidth, gap],
  );

  useEffect(() => {
    let continueRendering = true;
    const renderLoop = () => {
      if (analyserResources === null || continueRendering === false) return;
      const { analyser: analyzer, dataTarget: data } = analyserResources;
      analyzer.getByteFrequencyData(data);
      processFrequencyData(data);
      requestAnimationFrame(renderLoop);
    };
    renderLoop();
    return () => {
      continueRendering = false;
    };
  }, [analyserResources, processFrequencyData]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{
        aspectRatio: "unset",
      }}
    />
  );
};

const url = encodeURI("/assets/wǒ.wav");
export function AudioTest() {
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
    <div>
      <audio ref={audioRef} controls src={url} autoPlay />
      {audioSourceNode !== null && (
        <LiveAudioVisualizer
          mediaSource={audioSourceNode}
          width={500}
          fftSize={4096}
        />
      )}
    </div>
  );
}
