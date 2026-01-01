"use client";

import React, { useMemo, useState, useRef } from "react";
import { Segment } from "../../types/constants";
import { cn } from "../lib/utils";
import { Button } from "./Button";

export interface Track {
  id: string;
  name: string;
  segments: Segment[];
  height?: number;
}

interface TimelineProps {
  tracks: Track[];
  onSegmentClick: (segment: Segment, trackId: string, index: number) => void;
  onSegmentDelete: (trackId: string, index: number) => void;
  onSegmentReorder?: (fromTrackId: string, fromIndex: number, toTrackId: string, toIndex: number) => void;
  selectedSegment: { trackId: string; index: number } | null;
  pixelsPerSecond?: number;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSeek?: (timeInSeconds: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  onSegmentClick,
  onSegmentDelete,
  onSegmentReorder,
  selectedSegment,
  pixelsPerSecond = 100,
  currentTime = 0,
  onPlay,
  onPause,
  onReset,
  onSeek,
}) => {
  const [draggedSegment, setDraggedSegment] = useState<{ trackId: string; index: number } | null>(null);
  const [dragOverSegment, setDragOverSegment] = useState<{ trackId: string; index: number } | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  
  // Calculate total duration - find the maximum end time across all tracks
  const totalDuration = useMemo(() => {
    const allSegments = tracks.flatMap(track => track.segments);
    if (allSegments.length === 0) return 10; // Default 10 seconds
    const maxEnd = Math.max(
      ...allSegments.map((seg) => seg.start + seg.duration)
    );
    return Math.ceil(maxEnd + 2); // Add 2s padding
  }, [tracks]);

  // Generate time markers (every second)
  const timeMarkers = useMemo(() => {
    const markers = [];
    for (let i = 0; i <= totalDuration; i++) {
      markers.push(i);
    }
    return markers;
  }, [totalDuration]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Calculate timeline width
  const timelineWidth = totalDuration * pixelsPerSecond;
  
  // Calculate playhead position
  const playheadPosition = currentTime * pixelsPerSecond;

  // Handle clicking on the timeline to seek
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || isDraggingPlayhead) return;
    
    if (!timelineContainerRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const scrollLeft = timelineContainerRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const clickedTime = Math.max(0, Math.min(totalDuration, clickX / pixelsPerSecond));
    
    onSeek(clickedTime);
  };

  // Handle playhead drag
  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    if (!onSeek) return;
    e.stopPropagation();
    e.preventDefault();
    setIsDraggingPlayhead(true);
    
    // Prevent text selection during drag
    document.body.style.userSelect = "none";
  };

  React.useEffect(() => {
    if (!isDraggingPlayhead || !onSeek) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineContainerRef.current) return;

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const scrollLeft = timelineContainerRef.current.scrollLeft;
      const mouseX = e.clientX - rect.left + scrollLeft;
      const clickedTime = Math.max(0, Math.min(totalDuration, mouseX / pixelsPerSecond));
      
      onSeek(clickedTime);
    };

    const handleMouseUp = () => {
      setIsDraggingPlayhead(false);
      // Re-enable text selection
      document.body.style.userSelect = "";
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, onSeek, totalDuration, pixelsPerSecond]);

  return (
    <div className="w-full">
      {/* Controls */}
      {(onPlay || onPause || onReset) && (
        <div className="flex items-center gap-2 mb-4">
          {onPlay && (
            <Button onClick={onPlay} secondary>
              ▶ Play
            </Button>
          )}
          {onPause && (
            <Button onClick={onPause} secondary>
              ⏸ Pause
            </Button>
          )}
          {onReset && (
            <Button onClick={onReset} secondary>
              ⏮ Reset
            </Button>
          )}
        </div>
      )}
      <div 
        ref={timelineContainerRef}
        className="timeline-scrollbar cursor-grab w-full bg-[#1a1a1a] rounded-geist border border-unfocused-border-color overflow-x-auto select-none"
      >
        {/* Time Ruler */}
      <div 
        className={cn(
          "relative h-12 border-b border-unfocused-border-color select-none",
          onSeek && "cursor-pointer"
        )}
        style={{ width: `${timelineWidth}px`, minWidth: "100%", userSelect: "none" }}
        onClick={handleTimelineClick}
      >
        {/* Playhead on ruler */}
        {currentTime >= 0 && currentTime <= totalDuration && (
          <div
            className={cn(
              "absolute top-0 bottom-0 w-0.5 bg-blue-500 z-20",
              onSeek && "cursor-grab active:cursor-grabbing"
            )}
            style={{
              left: `${playheadPosition}px`,
            }}
            onMouseDown={handlePlayheadMouseDown}
          >
            <div 
              className={cn(
                "absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-500",
                onSeek && "cursor-grab active:cursor-grabbing"
              )}
              onMouseDown={handlePlayheadMouseDown}
            />
          </div>
        )}
        <div className="absolute inset-0 flex select-none">
          {timeMarkers.map((time) => (
            <div
              key={time}
              className="relative border-l border-unfocused-border-color select-none"
              style={{ width: `${pixelsPerSecond}px`, flexShrink: 0, userSelect: "none" }}
            >
              <div 
                className="absolute top-0 left-0 px-1 text-xs text-disabled-text-color select-none"
                style={{ userSelect: "none" }}
              >
                {formatTime(time)}
              </div>
              <div className="absolute bottom-0 left-0 w-px h-2 bg-unfocused-border-color" />
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="relative">
        {tracks.map((track) => {
          const trackHeight = track.height || 100;
          const sortedSegments = useMemo(() => {
            return [...track.segments].sort((a, b) => a.start - b.start);
          }, [track.segments]);

          return (
            <div
              key={track.id}
              className={cn(
                "relative border-b border-unfocused-border-color select-none",
                onSeek && "cursor-pointer"
              )}
              style={{
                height: `${trackHeight}px`,
                width: `${timelineWidth}px`,
                minWidth: "100%",
                userSelect: "none",
              }}
              onClick={handleTimelineClick}
            >
              {/* Track Label */}
              <div
                className="absolute left-0 top-0 h-full bg-[#252525] border-r border-unfocused-border-color flex items-center justify-center z-10"
                style={{ width: "80px" }}
              >
                <span className="text-xs text-disabled-text-color font-medium">
                  {track.name}
                </span>
              </div>

              {/* Track Content */}
              <div
                className="relative ml-20 h-full"
                style={{ width: `calc(100% - 80px)` }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {timeMarkers.map((time) => (
                    <div
                      key={time}
                      className="border-l border-unfocused-border-color/30"
                      style={{ width: `${pixelsPerSecond}px`, flexShrink: 0 }}
                    />
                  ))}
                </div>

                {/* Playhead line */}
                {currentTime >= 0 && currentTime <= totalDuration && (
                  <div
                    className={cn(
                      "absolute top-0 bottom-0 w-0.5 bg-blue-500 z-30",
                      onSeek && "cursor-grab active:cursor-grabbing"
                    )}
                    style={{
                      left: `${playheadPosition}px`,
                    }}
                    onMouseDown={handlePlayheadMouseDown}
                  />
                )}

                {/* Segments */}
                <div className="relative h-full" style={{ width: `${timelineWidth}px` }}>
                  {sortedSegments.map((segment, segmentIndex) => {
                    const left = segment.start * pixelsPerSecond;
                    const width = segment.duration * pixelsPerSecond;
                    const isSelected =
                      selectedSegment?.trackId === track.id &&
                      selectedSegment?.index === segmentIndex;
                    const isDragging =
                      draggedSegment?.trackId === track.id &&
                      draggedSegment?.index === segmentIndex;
                    const isDragOver =
                      dragOverSegment?.trackId === track.id &&
                      dragOverSegment?.index === segmentIndex;

                    // Determine segment color based on type
                    const getSegmentColor = () => {
                      if (segment.type === "text") {
                        return isSelected
                          ? "bg-purple-600 border-blue-400"
                          : "bg-purple-700/80 border-purple-500";
                      } else if (segment.type === "code") {
                        return isSelected
                          ? "bg-blue-600 border-blue-400"
                          : "bg-blue-700/80 border-blue-500";
                      } else if (segment.type === "audio") {
                        return isSelected
                          ? "bg-green-600 border-green-400"
                          : "bg-green-700/80 border-green-500";
                      } else if (segment.type === "gif") {
                        return isSelected
                          ? "bg-orange-600 border-orange-400"
                          : "bg-orange-700/80 border-orange-500";
                      }
                      return "bg-gray-600 border-gray-500";
                    };

                    const getSegmentIcon = () => {
                      if (segment.type === "text") return "📝";
                      if (segment.type === "code") return "💻";
                      if (segment.type === "audio") return "🔊";
                      if (segment.type === "gif") return "🎬";
                      return "📄";
                    };

                    const getSegmentLabel = () => {
                      if (segment.type === "text") return "Text";
                      if (segment.type === "code") return "Code";
                      if (segment.type === "audio") return "Audio";
                      if (segment.type === "gif") return "GIF";
                      return "Segment";
                    };

                    const getSegmentSubLabel = () => {
                      if (segment.type === "text") return segment.text;
                      if (segment.type === "code") return segment.language;
                      if (segment.type === "audio") {
                        return segment.name || (() => {
                          const urlParts = segment.audioUrl.split("/");
                          return urlParts[urlParts.length - 1] || "Audio file";
                        })();
                      }
                      if (segment.type === "gif") {
                        return segment.name || (() => {
                          const urlParts = segment.gifUrl.split("/");
                          return urlParts[urlParts.length - 1] || "GIF file";
                        })();
                      }
                      return "";
                    };

                    return (
                      <div
                        key={segmentIndex}
                        draggable={!!onSegmentReorder}
                        onDragStart={(e) => {
                          setDraggedSegment({ trackId: track.id, index: segmentIndex });
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData(
                            "text/plain",
                            `${track.id}:${segmentIndex}`
                          );
                        }}
                        onDragEnd={() => {
                          setDraggedSegment(null);
                          setDragOverSegment(null);
                        }}
                        onDragOver={(e) => {
                          if (
                            onSegmentReorder &&
                            (draggedSegment?.trackId !== track.id ||
                              draggedSegment?.index !== segmentIndex)
                          ) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                            setDragOverSegment({ trackId: track.id, index: segmentIndex });
                          }
                        }}
                        onDragLeave={() => {
                          setDragOverSegment(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          if (
                            onSegmentReorder &&
                            draggedSegment !== null &&
                            (draggedSegment.trackId !== track.id ||
                              draggedSegment.index !== segmentIndex)
                          ) {
                            onSegmentReorder(
                              draggedSegment.trackId,
                              draggedSegment.index,
                              track.id,
                              segmentIndex
                            );
                          }
                          setDraggedSegment(null);
                          setDragOverSegment(null);
                        }}
                        className={cn(
                          "absolute rounded cursor-pointer transition-all hover:opacity-90",
                          "border-2 flex items-center gap-2 px-3 overflow-hidden",
                          isDragging && "opacity-50 scale-95 z-50",
                          isDragOver && "ring-2 ring-yellow-400 ring-offset-2",
                          getSegmentColor()
                        )}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          minWidth: "60px",
                          height: `${trackHeight - 16}px`,
                          top: "8px",
                          cursor: onSegmentReorder ? "grab" : "pointer",
                        }}
                        onClick={(e) => {
                          if (!isDragging) {
                            e.stopPropagation();
                            onSegmentClick(segment, track.id, segmentIndex);
                          }
                        }}
                        title={`${getSegmentLabel()}: ${formatTime(segment.start)} - ${formatTime(segment.start + segment.duration)}${onSegmentReorder ? " (Drag to reorder)" : ""}`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-lg">{getSegmentIcon()}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-white truncate">
                              {getSegmentLabel()}
                            </div>
                            <div className="text-xs text-white/70 truncate">
                              {getSegmentSubLabel()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSegmentDelete(track.id, segmentIndex);
                          }}
                          className="text-white/70 hover:text-white transition-colors px-1"
                          title="Delete segment"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                {track.segments.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-disabled-text-color text-sm">
                    No segments
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </div>
    </div>
  );
};

