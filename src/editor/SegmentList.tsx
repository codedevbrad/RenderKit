"use client";

import React, { useMemo } from "react";
import { Segment } from "../../types/constants";
import { Track } from "./Timeline";

interface SegmentListProps {
  tracks: Track[];
}

export const SegmentList: React.FC<SegmentListProps> = ({ tracks }) => {
  // Get all segments from all tracks and sort by start time
  const allSegments = useMemo(() => {
    const segments: Segment[] = [];
    
    tracks.forEach((track) => {
      track.segments.forEach((segment) => {
        segments.push(segment);
      });
    });
    
    // Sort by start time
    return segments.sort((a, b) => a.start - b.start);
  }, [tracks]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 100);
    return `${mins}:${secs.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`;
  };

  const getSegmentTitle = (segment: Segment): string => {
    if (segment.type === "text") {
      return segment.text || "Text Segment";
    } else if (segment.type === "code") {
      return segment.language ? `${segment.language} Code` : "Code Segment";
    } else if (segment.type === "audio") {
      return segment.name || (() => {
        const urlParts = segment.audioUrl.split("/");
        return urlParts[urlParts.length - 1] || "Audio Segment";
      })();
    } else if (segment.type === "gif") {
      return segment.name || (() => {
        const urlParts = segment.gifUrl.split("/");
        return urlParts[urlParts.length - 1] || "GIF Segment";
      })();
    }
    return "Segment";
  };

  if (allSegments.length === 0) {
    return (
      <div className="text-sm text-foreground/60 p-4">
        No segments yet
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {allSegments.map((segment, index) => (
        <div
          key={`${segment.start}-${index}`}
          className="flex items-center justify-between py-2 px-3 border-b border-unfocused-border-color/30 last:border-b-0 hover:bg-foreground/5 transition-colors"
        >
          <span className="text-sm text-foreground flex-1 truncate pr-2" title={getSegmentTitle(segment)}>
            {getSegmentTitle(segment)}
          </span>
          <span className="text-xs text-foreground/60 font-mono flex-shrink-0">
            {formatTime(segment.start)}
          </span>
        </div>
      ))}
    </div>
  );
};

