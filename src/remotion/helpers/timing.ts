import { useVideoConfig } from "remotion";

/**
 * Helper hook to calculate timing based on video duration
 */
export const useTiming = () => {
  const { durationInFrames, fps } = useVideoConfig();

  /**
   * Convert seconds to frames
   */
  const secondsToFrames = (seconds: number): number => {
    return Math.round(seconds * fps);
  };

  /**
   * Convert frames to seconds
   */
  const framesToSeconds = (frames: number): number => {
    return frames / fps;
  };

  /**
   * Calculate a percentage of the total duration
   */
  const percentOfDuration = (percent: number): number => {
    return Math.round((durationInFrames * percent) / 100);
  };

  return {
    durationInFrames,
    fps,
    secondsToFrames,
    framesToSeconds,
    percentOfDuration,
  };
};

/**
 * Helper function to calculate sequence timing
 */
export interface SequenceTiming {
  from: number;
  duration: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

export const calculateSequenceTiming = (
  startSecond: number,
  durationSeconds: number,
  fps: number,
  fadeInSeconds: number = 0.5,
  fadeOutSeconds: number = 0.5
): SequenceTiming => {
  return {
    from: Math.round(startSecond * fps),
    duration: Math.round(durationSeconds * fps),
    fadeInDuration: Math.round(fadeInSeconds * fps),
    fadeOutDuration: Math.round(fadeOutSeconds * fps),
  };
};

