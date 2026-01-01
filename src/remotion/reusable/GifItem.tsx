import React from "react";
import { Img } from "remotion";
import { SequenceItem } from "./SequenceItem";
import { TextFade } from "./TextFade";

export interface GifItemProps {
  from: number;
  duration: number;
  gifUrl: string;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInDelay?: number;
  fadeOutDelay?: number;
}

export const GifItem: React.FC<GifItemProps> = ({
  from,
  duration,
  gifUrl,
  fadeInDuration = 30,
  fadeOutDuration = 30,
  fadeInDelay = 0,
  fadeOutDelay,
}) => {
  // Calculate fade out delay if not provided (fade out at the end)
  const calculatedFadeOutDelay =
    fadeOutDelay !== undefined
      ? fadeOutDelay
      : duration - fadeOutDuration - fadeInDelay - fadeInDuration;

  return (
    <SequenceItem from={from} duration={duration}>
      <TextFade
        fadeInDuration={fadeInDuration}
        fadeOutDuration={fadeOutDuration}
        fadeInDelay={fadeInDelay}
        fadeOutDelay={calculatedFadeOutDelay}
      >
        <Img
          src={gifUrl}
          style={{
            maxWidth: "100%",
            maxHeight: "100%",
            objectFit: "contain",
            opacity: 0.5,
          }}
        />
      </TextFade>
    </SequenceItem>
  );
};

