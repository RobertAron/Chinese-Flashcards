"use client";
// https://github.com/samhirtarif/react-audio-visualize
import { getAudioContext } from "@/utils/audioContext";
import { useCallback, useEffect, useRef, useState } from "react";

function average(nums: number[]) {
  if (nums.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < nums.length; ++i) {
    sum += nums[i]!;
  }
  return sum / nums.length;
}

export const calculateBarData = (
  frequencyData: Uint8Array,
  desiredBars = 100,
): number[] => {
  const startingPoint = Math.floor(frequencyData.length * 0)
  const endpointPoint = Math.floor(frequencyData.length * .5)
  const usefulDataPoints = frequencyData.slice(
    startingPoint,
    endpointPoint,
  );
  const results = new Array(desiredBars).fill(null).map((): number[] => []);
  const highestBase2 = Math.log2(usefulDataPoints.length);
  const scaling = desiredBars / highestBase2;
  for (let i = 0; i < usefulDataPoints.length; ++i) {
    const item = usefulDataPoints[i]!;
    const targetBar = i === 0 ? 0 : Math.floor(Math.log2(i) * scaling);
    results[targetBar]!.push(item);
  }
  return results.map((ele) => average(ele));
};

const width = 236;
const height = 128;
export const draw = (
  data: number[],
  canvas: HTMLCanvasElement,
  barWidth: number,
  gap: number,
  backgroundColor: string,
  barColor: string,
): void => {
  const itemWidth = width / data.length;
  const ctx = canvas.getContext("2d")!;
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // set bg
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // start drawing

  data.forEach((dp, i) => {
    const dataPointAmp = dp * .5;
    ctx.fillStyle = barColor;
    const x = (i / data.length) * width;
    const y = height - dataPointAmp;
    const w = itemWidth;
    const h = dataPointAmp;
    ctx.fillRect(x, y, w, h);
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

export const LiveAudioVisualizer = ({
  mediaSource: mediaSource,
  barWidth = 2,
  gap = 1,
  backgroundColor = "transparent",
  barColor = "rgb(160, 198, 255)",
  fftSize = 16384,
  maxDecibels = -25,
  minDecibels = -90,
  smoothingTimeConstant = 0.1,
}: Props) => {
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
    <div className="aspect-[unset] h-full w-full rounded-md border border-black">
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};
