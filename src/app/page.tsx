"use client";

import { Player, PlayerRef } from "@remotion/player";
import type { NextPage } from "next";
import { useMemo, useState, useRef, useEffect } from "react";
import { z } from "zod";
import {
  defaultMyCompProps,
  CompositionProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
  Segment,
} from "../../types/constants";
import { RenderControls } from "../components/RenderControls";
import { SegmentEditor } from "../components/SegmentEditor";
import { Spacing } from "../components/Spacing";
import { Tips } from "../components/Tips";
import { Main } from "../remotion/Main";

const Home: NextPage = () => {
  const [segments, setSegments] = useState<Segment[]>(
    defaultMyCompProps.segments
  );
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      segments,
    };
  }, [segments]);

  // Calculate total duration based on segments - find maximum end time
  const durationInFrames = useMemo(() => {
    if (segments.length === 0) return 30; // 1 second default
    const maxEnd = Math.max(
      ...segments.map((seg) => seg.start + seg.duration)
    );
    return Math.ceil(maxEnd * VIDEO_FPS);
  }, [segments]);

  // Update current time from player
  useEffect(() => {
    const interval = setInterval(() => {
      if (playerRef.current) {
        const frame = playerRef.current.getCurrentFrame();
        const timeInSeconds = frame / VIDEO_FPS;
        setCurrentTime(timeInSeconds);
      }
    }, 100); // Update every 100ms for smooth animation

    return () => clearInterval(interval);
  }, []);

  // Player control functions
  const handlePlay = () => {
    playerRef.current?.play();
  };

  const handlePause = () => {
    playerRef.current?.pause();
  };

  const handleReset = () => {
    playerRef.current?.seekTo(0);
    playerRef.current?.pause();
  };

  const handleSeek = (timeInSeconds: number) => {
    const frame = Math.floor(timeInSeconds * VIDEO_FPS);
    playerRef.current?.seekTo(frame);
    setCurrentTime(timeInSeconds);
  };

  return (
    <div className="p-6">
      <div className="max-w-screen-2xl m-auto mb-5">
        <div className="flex flex-col mt-16">
          {/* Preview Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Preview</h2>
            <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)]">
              <Player
                ref={playerRef}
                component={Main}
                inputProps={inputProps}
                durationInFrames={durationInFrames}
                fps={VIDEO_FPS}
                compositionHeight={VIDEO_HEIGHT}
                compositionWidth={VIDEO_WIDTH}
                style={{
                  width: "100%",
                }}
                controls
                autoPlay
                loop
              />
            </div>
          </div>

          {/* Editor Section */}
          <div>
            <SegmentEditor
              segments={segments}
              onSegmentsChange={setSegments}
              currentTime={currentTime}
              onPlay={handlePlay}
              onPause={handlePause}
              onReset={handleReset}
              onSeek={handleSeek}
            />
            <Spacing></Spacing>
            <RenderControls
              segments={segments}
              setSegments={setSegments}
              inputProps={inputProps}
            ></RenderControls>
          </div>
        </div> 
      </div>
    </div>
  );
};

export default Home;
