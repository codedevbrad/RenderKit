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
  Layer,
} from "../../types/constants";
import { RenderControls } from "../editor/RenderControls";
import { SegmentEditor } from "../editor/SegmentEditor";
import { Main } from "../remotion/Main";

const Home: NextPage = () => {
  const [segments, setSegments] = useState<Segment[]>(
    defaultMyCompProps.segments || []
  );
  const [layers, setLayers] = useState<Layer[]>(
    defaultMyCompProps.layers || [
      { id: "video-1", name: "Video Layer 1", type: "video", order: 0 },
      { id: "audio-1", name: "Audio Layer 1", type: "audio", order: 1 },
    ]
  );
  const [currentTime, setCurrentTime] = useState(0);
  const playerRef = useRef<PlayerRef>(null);

  const inputProps: z.infer<typeof CompositionProps> = useMemo(() => {
    return {
      segments,
      layers,
    };
  }, [segments, layers]);

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
    <div className="h-full flex flex-col overflow-hidden">
    
      <div className="flex-1 flex flex-col min-h-0 p-4">
        
        <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden shadow-2xl p-5">
          <div className="flex flex-col ">
            <h2 className="text-xl font-bold mb-2 text-foreground">Preview</h2>
            <p className="text-sm text-foreground/60">
              Build your video with the timeline and preview it here. Using segments to add content to the video.
            </p>
            <RenderControls
              segments={segments}
              setSegments={setSegments}
              inputProps={inputProps}
            />
          </div>
          <div className="w-full h-full flex items-center justify-center">
                <Player
                  ref={playerRef}
                  component={Main}
                  inputProps={inputProps}
                  durationInFrames={durationInFrames}
                  fps={VIDEO_FPS}
                  compositionHeight={VIDEO_HEIGHT}
                  compositionWidth={VIDEO_WIDTH}
                  style={{
                    width: "60%",
                    height: "100%",
                    maxWidth: "100%",
                    maxHeight: "100%",
                    borderRadius: "10px",
                  }}
                  controls
                  autoPlay
                  loop
                />
         
          </div>
        </div>
      </div>

      {/* Timeline Section - Fixed height */}
      <div className="flex-shrink-0 h-[600px] max-h-[40vh]">
        <SegmentEditor
          segments={segments}
          onSegmentsChange={setSegments}
          layers={layers}
          onLayersChange={setLayers}
          currentTime={currentTime}
          onPlay={handlePlay}
          onPause={handlePause}
          onReset={handleReset}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
};

export default Home;