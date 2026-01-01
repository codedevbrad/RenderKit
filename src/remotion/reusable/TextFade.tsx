import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export interface TextFadeProps {
  children: React.ReactNode;
  fadeInDuration?: number; // frames to fade in
  fadeOutDuration?: number; // frames to fade out
  fadeInDelay?: number; // frames to wait before fading in
  fadeOutDelay?: number; // frames to wait before fading out (from start of fade out)
}

export const TextFade: React.FC<TextFadeProps> = ({
  children,
  fadeInDuration = 30,
  fadeOutDuration = 30,
  fadeInDelay = 0,
  fadeOutDelay = 0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate opacity based on fade in/out
  const opacity = useMemo(() => {
    // Fade in
    if (frame < fadeInDelay) {
      return 0;
    }
    if (frame < fadeInDelay + fadeInDuration) {
      return interpolate(
        frame,
        [fadeInDelay, fadeInDelay + fadeInDuration],
        [0, 1],
        {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        }
      );
    }

    // Full opacity period
    const fadeOutStart = frame - fadeInDelay - fadeInDuration;
    
    // Check if we should fade out (this requires knowing total duration)
    // For now, we'll use a spring-based approach that works within the sequence
    const fadeOutProgress = spring({
      fps,
      frame: Math.max(0, frame - fadeInDelay - fadeInDuration),
      config: {
        damping: 200,
      },
      durationInFrames: fadeOutDuration,
      delay: fadeOutDelay,
    });

    // If we're in fade out phase, calculate opacity
    if (fadeOutDuration > 0 && fadeOutDelay >= 0) {
      return 1 - fadeOutProgress;
    }

    return 1;
  }, [frame, fadeInDuration, fadeInDelay, fadeOutDuration, fadeOutDelay, fps]);

  return (
    <AbsoluteFill>
      <AbsoluteFill className="justify-center items-center p-10">
        <div
          style={{
            opacity,
            transition: "opacity 0.1s",
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
