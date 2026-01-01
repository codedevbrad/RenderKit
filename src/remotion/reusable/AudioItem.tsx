import React, { useMemo } from "react";
import { Audio, Sequence, useCurrentFrame } from "remotion";
import { interpolate } from "remotion";

export interface AudioItemProps {
  from: number;
  duration: number;
  audioUrl: string;
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInDelay?: number;
  fadeOutDelay?: number;
}

export const AudioItem: React.FC<AudioItemProps> = ({
  from,
  duration, // duration in frames
  audioUrl,
  volume = 1,
  fadeInDuration = 0, // fadeInDuration in frames
  fadeOutDuration = 0, // fadeOutDuration in frames
  fadeInDelay = 0, // fadeInDelay in frames
  fadeOutDelay, // fadeOutDelay in frames
}) => {
  const frame = useCurrentFrame();

  // Calculate fade out delay if not provided (fade out at the end)
  const calculatedFadeOutDelay =
    fadeOutDelay !== undefined
      ? fadeOutDelay
      : duration - fadeOutDuration - fadeInDelay - fadeInDuration;

  // Calculate volume with fade in/out (frame-based)
  const currentVolume = useMemo(() => {
    // Only apply fade-in if fadeInDuration > 0
    if (fadeInDuration > 0) {
      const fadeInEnd = fadeInDelay + fadeInDuration;
      if (frame < fadeInEnd) {
        return interpolate(
          frame,
          [fadeInDelay, fadeInEnd],
          [0, volume],
          {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }
        );
      }
    }

    // Only apply fade-out if fadeOutDuration > 0
    if (fadeOutDuration > 0) {
      const fadeOutStart = duration - calculatedFadeOutDelay - fadeOutDuration;
      if (frame > fadeOutStart) {
        return interpolate(
          frame,
          [fadeOutStart, duration],
          [volume, 0],
          {
            extrapolateRight: "clamp",
            extrapolateLeft: "clamp",
          }
        );
      }
    }

    return volume;
  }, [frame, duration, fadeInDuration, fadeInDelay, fadeOutDuration, calculatedFadeOutDelay, volume]);

  return (
    <Sequence from={from} durationInFrames={duration}>
      <Audio
        src={audioUrl}
        volume={currentVolume}
        startFrom={0}
      />
    </Sequence>
  );
};

