import React from "react";
import { Sequence, AbsoluteFill } from "remotion";
import { TextFade, TextFadeProps } from "./TextFade";
import { CodeSnippet, CodeSnippetProps } from "./CodeSnippet";

export interface SequenceItemProps {
  from: number; // Start frame
  duration: number; // Duration in frames
  children: React.ReactNode;
}

export const SequenceItem: React.FC<SequenceItemProps> = ({
  from,
  duration,
  children,
}) => {
  return (
    <Sequence from={from} durationInFrames={duration}>
      {children}
    </Sequence>
  );
};

// Text item with fade in/out
export interface TextItemProps {
  from: number;
  duration: number;
  text: string;
  style?: React.CSSProperties;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInDelay?: number;
  fadeOutDelay?: number;
}

export const TextItem: React.FC<TextItemProps> = ({
  from,
  duration,
  text,
  fadeInDuration = 30,
  fadeOutDuration = 30,
  fadeInDelay = 0,
  fadeOutDelay,
  style,
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
        <div
          style={{
            fontSize: "60px",
            fontWeight: "bold",
            textAlign: "center",
            color: "white",
            ...style,
          }}
        >
          {text}
        </div>
      </TextFade>
    </SequenceItem>
  );
};

// Code item with fade in/out
export interface CodeItemProps extends CodeSnippetProps {
  from: number;
  duration: number;
}

export const CodeItem: React.FC<CodeItemProps> = ({
  from,
  duration,
  code,
  language,
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
      <CodeSnippet
        code={code}
        language={language}
        fadeInDuration={fadeInDuration}
        fadeOutDuration={fadeOutDuration}
        fadeInDelay={fadeInDelay}
        fadeOutDelay={calculatedFadeOutDelay}
      />
    </SequenceItem>
  );
};

