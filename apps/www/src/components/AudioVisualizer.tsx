"use client";
// https://github.com/samhirtarif/react-audio-visualize
import { getAudioContext } from "@/utils/audioContext";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

function average(nums: number[]) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; ++i) {
    sum += nums[i]!;
  }
  return sum / nums.length;
}

export const calculateBarData = (frequencyData: Uint8Array, desiredBars = 4000): number[] => {
  const startingPoint = Math.floor(frequencyData.length * 0);
  const endpointPoint = Math.floor(frequencyData.length * 0.5);
  const usefulDataPoints = frequencyData.slice(startingPoint, endpointPoint);
  const results = Array.from({ length: desiredBars }, (): number[] => []);
  const highestBase2 = Math.log2(usefulDataPoints.length);
  const scaling = desiredBars / highestBase2;
  for (let i = 0; i < usefulDataPoints.length; ++i) {
    const item = usefulDataPoints[i]!;
    const targetBar = i === 0 ? 0 : Math.floor(Math.log2(i) * scaling);
    results[targetBar]!.push(item);
  }
  return results.map((ele) => average(ele));
};

export const draw = (data: number[], canvas: HTMLCanvasElement): void => {
  const width = canvas.width;
  const height = canvas.height;
  const itemWidth = width / data.length;
  const ctx = canvas.getContext("2d")!;
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // start drawing
  for (let i = 0; i < data.length; ++i) {
    const dataPoint = data[i]!;
    if (dataPoint === 0) continue;
    const dataPointHeightNormalized = Math.min(dataPoint / 230, 200);
    const dataPointHeight = dataPointHeightNormalized * height * 0.9;
    const x = (i / data.length) * width;
    const y = height - dataPointHeight;
    const w = itemWidth + 2;
    ctx.fillStyle = `rgb(${dataPointHeightNormalized * 255} 0 ${255 - dataPointHeightNormalized * 255})`;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), dataPointHeight);
  }
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
  fftSize?: 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192 | 16384 | 32768;
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

export const LiveAudioVisualizer = ({
  mediaSource,
  fftSize = 8192,
  maxDecibels = -25,
  minDecibels = -85,
  smoothingTimeConstant = 0.01,
}: Props) => {
  const [[width, height], setCanvasSize] = useState<[number, number]>([0, 0]);
  const containerRef = useRef<HTMLDivElement>(null!);
  const [analyserResources, setAnalyserResources] = useState<{
    analyser: AnalyserNode;
    dataTarget: Uint8Array;
  } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const analyser = getAudioContext().createAnalyser();
    analyser.fftSize = fftSize;
    analyser.maxDecibels = maxDecibels;
    analyser.minDecibels = minDecibels;
    analyser.smoothingTimeConstant = smoothingTimeConstant;
    const data = new Uint8Array(analyser.frequencyBinCount);
    setAnalyserResources({
      analyser: analyser,
      dataTarget: data,
    });
    mediaSource.connect(analyser);
    return () => analyser.disconnect();
  }, [fftSize, maxDecibels, mediaSource, minDecibels, smoothingTimeConstant]);

  const processFrequencyData = useCallback((data: Uint8Array): void => {
    if (!canvasRef.current) return;
    if(Math.max(...data)===0) draw([], canvasRef.current);
    else draw(calculateBarData(data), canvasRef.current);
  }, []);

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

  useLayoutEffect(() => {
    const { width, height } = containerRef.current.getBoundingClientRect();
    setCanvasSize([width, height]);
  }, []);
  useEffect(() => {
    const resizeObserver = new ResizeObserver((cb) => {
      for (const { contentRect: rect } of cb) {
        setCanvasSize([rect.width, rect.height]);
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div
      className="relative h-full w-full overflow-hidden rounded-md border-[1.5px] border-black"
      ref={containerRef}
    >
      <canvas className="absolute inset-0" ref={canvasRef} width={width * 2} height={height * 2} />
    </div>
  );
};
