"use client";

import React, { useMemo, useState, useRef } from "react";
import { Segment } from "../../types/constants";
import { cn } from "../lib/utils";
import { Button } from "../components/Button";

export interface Track {
  id: string;
  name: string;
  segments: Segment[];
  height?: number;
  type?: "video" | "audio";
}

interface TimelineProps {
  tracks: Track[];
  onSegmentClick: (segment: Segment, trackId: string, index: number) => void;
  onSegmentDelete: (trackId: string, index: number) => void;
  onSegmentReorder?: (fromTrackId: string, fromIndex: number, toTrackId: string, toIndex: number) => void;
  onSegmentMove?: (segment: Segment, newLayerId: string, newStartTime: number) => void;
  onSegmentCreate?: (type: "text" | "code" | "audio" | "gif", layerId: string, startTime: number, duration: number) => void;
  selectedSegment: { trackId: string; index: number } | null;
  pixelsPerSecond?: number;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSeek?: (timeInSeconds: number) => void;
  onLayerDelete?: (layerId: string) => void;
  onStartRenameLayer?: (layerId: string, currentName: string) => void;
  isRenamingLayer?: string | null;
  layerRenameValue?: string;
  onLayerRenameValueChange?: (value: string) => void;
  onLayerRenameConfirm?: (layerId: string, newName: string) => void;
  onLayerRenameCancel?: () => void;
  onAddVideoLayer?: () => void;
  onAddAudioLayer?: () => void;
  draggingFromPalette?: { type: "text" | "code" | "audio" | "gif"; duration: number } | null;
}

export const Timeline: React.FC<TimelineProps> = ({
  tracks,
  onSegmentClick,
  onSegmentDelete,
  onSegmentReorder,
  onSegmentMove,
  onSegmentCreate,
  selectedSegment,
  pixelsPerSecond = 100,
  currentTime = 0,
  onPlay,
  onPause,
  onReset,
  onSeek,
  onLayerDelete,
  onStartRenameLayer,
  isRenamingLayer,
  layerRenameValue,
  onLayerRenameValueChange,
  onLayerRenameConfirm,
  onLayerRenameCancel,
  onAddVideoLayer,
  onAddAudioLayer,
  draggingFromPalette,
}) => {
  const [draggedSegment, setDraggedSegment] = useState<{ trackId: string; index: number; segment: Segment; dragOffset: { x: number; y: number } } | null>(null);
  const [dragOverSegment, setDragOverSegment] = useState<{ trackId: string; index: number } | null>(null);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState(false);
  const [dragPreview, setDragPreview] = useState<{ trackId: string; startTime: number } | null>(null);
  const [hasDragged, setHasDragged] = useState(false);
  const [paletteDragPreview, setPaletteDragPreview] = useState<{ trackId: string; startTime: number } | null>(null);
  const timelineContainerRef = useRef<HTMLDivElement>(null);
  
  // Ensure layerRenameValue is always a string to prevent controlled/uncontrolled input warnings
  const normalizedLayerRenameValue = layerRenameValue ?? "";
  
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

  // Handle segment dragging for time and layer changes
  React.useEffect(() => {
    if (!draggedSegment || !onSegmentMove) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineContainerRef.current) return;

      // Mark that we've actually dragged (not just clicked)
      setHasDragged(true);

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const scrollLeft = timelineContainerRef.current.scrollLeft;
      const scrollTop = timelineContainerRef.current.scrollTop;
      
      // Calculate mouse position relative to timeline container
      const mouseX = e.clientX - rect.left + scrollLeft;
      const mouseY = e.clientY - rect.top + scrollTop;

      // Calculate target time accounting for drag offset (so segment follows mouse naturally)
      // Subtract the offset to get where the segment's left edge should be
      const targetLeft = mouseX - draggedSegment.dragOffset.x;
      const targetTime = Math.max(0, Math.min(totalDuration - draggedSegment.segment.duration, targetLeft / pixelsPerSecond));
      // Snap to 0.1 second intervals for better UX
      const snappedTime = Math.round(targetTime * 10) / 10;

      // Find target track based on Y position
      // Account for time ruler height (56px = h-14)
      const rulerHeight = 56;
      let currentY = rulerHeight;
      let targetTrackId = draggedSegment.trackId;

      // Check for video header
      if (tracks.length > 0 && tracks[0]?.type === "video") {
        currentY += 24; // Video header height
      }

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const trackHeight = track.height || 30;
        
        // Check for audio header (first audio track after video tracks)
        if (track.type === "audio" && i > 0 && tracks[i - 1]?.type === "video") {
          currentY += 24; // Audio header height
        }

        if (mouseY >= currentY && mouseY < currentY + trackHeight) {
          targetTrackId = track.id;
          break;
        }

        currentY += trackHeight;
      }

      setDragPreview({ trackId: targetTrackId, startTime: snappedTime });
    };

    const handleMouseUp = () => {
      const wasDragging = hasDragged;
      
      if (dragPreview && draggedSegment && onSegmentMove && wasDragging) {
        onSegmentMove(
          draggedSegment.segment,
          dragPreview.trackId,
          dragPreview.startTime
        );
      }
      setDraggedSegment(null);
      setDragPreview(null);
      // Reset hasDragged after a short delay to allow onClick to check it
      setTimeout(() => setHasDragged(false), 0);
      document.body.style.userSelect = "";
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedSegment, dragPreview, onSegmentMove, totalDuration, pixelsPerSecond, tracks, hasDragged]);

  // Handle dragging from palette
  React.useEffect(() => {
    if (!draggingFromPalette) {
      setPaletteDragPreview(null);
      return;
    }

    const updatePaletteDragPreview = (e: MouseEvent | DragEvent) => {
      if (!timelineContainerRef.current) {
        setPaletteDragPreview(null);
        return;
      }

      const rect = timelineContainerRef.current.getBoundingClientRect();
      const scrollLeft = timelineContainerRef.current.scrollLeft;
      const scrollTop = timelineContainerRef.current.scrollTop;
      
      const mouseX = e.clientX - rect.left + scrollLeft;
      const mouseY = e.clientY - rect.top + scrollTop;

      // Center the segment on the cursor position
      const cursorTime = mouseX / pixelsPerSecond;
      const halfDuration = draggingFromPalette.duration / 2;
      const targetTime = Math.max(0, Math.min(totalDuration - draggingFromPalette.duration, cursorTime - halfDuration));
      const snappedTime = Math.round(targetTime * 10) / 10;

      const rulerHeight = 56;
      let currentY = rulerHeight;
      let targetTrackId: string | null = null;

      if (tracks.length > 0 && tracks[0]?.type === "video") {
        currentY += 24;
      }

      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        const trackHeight = track.height || 30;
        
        if (track.type === "audio" && i > 0 && tracks[i - 1]?.type === "video") {
          currentY += 24;
        }

        const isCompatible = draggingFromPalette.type === "audio" 
          ? track.type === "audio"
          : track.type === "video";

        if (mouseY >= currentY && mouseY < currentY + trackHeight && isCompatible) {
          targetTrackId = track.id;
          break;
        }

        currentY += trackHeight;
      }

      if (targetTrackId) {
        setPaletteDragPreview({ trackId: targetTrackId, startTime: snappedTime });
      } else {
        setPaletteDragPreview(null);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = "copy";
      }
      updatePaletteDragPreview(e);
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      // The drop is handled by the track's onDrop handler
      setPaletteDragPreview(null);
      document.body.style.userSelect = "";
    };

    const handleMouseMove = (e: MouseEvent) => {
      updatePaletteDragPreview(e);
    };

    const handleMouseUp = () => {
      // Use the current paletteDragPreview state via closure
      setPaletteDragPreview((currentPreview) => {
        if (currentPreview && draggingFromPalette && onSegmentCreate) {
          onSegmentCreate(
            draggingFromPalette.type,
            currentPreview.trackId,
            currentPreview.startTime,
            draggingFromPalette.duration
          );
        }
        return null;
      });
      document.body.style.userSelect = "";
    };

    document.addEventListener('dragover', handleDragOver);
    document.addEventListener('drop', handleDrop);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
      document.removeEventListener('drop', handleDrop);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingFromPalette, onSegmentCreate, totalDuration, pixelsPerSecond, tracks]);

  return (
    <div className="w-full h-full flex flex-col min-h-0 bg-gradient-to-b from-[#0f0f0f] to-[#1a1a1a]">
    
      {/* Controls */}
      {(onPlay || onPause || onReset) && (
        <div className="flex items-center justify-center gap-3 mb-4 flex-shrink-0 px-1 mt-5">
          {onPlay && (
            <Button onClick={onPlay} secondary>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </span>
            </Button>
          )}
          {onPause && (
            <Button onClick={onPause} secondary>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75A.75.75 0 007.25 3h-1.5zM12.75 3a.75.75 0 00-.75.75v12.5c0 .414.336.75.75.75h1.5a.75.75 0 00.75-.75V3.75a.75.75 0 00-.75-.75h-1.5z" />
                </svg>
              </span>
            </Button>
          )}
          {onReset && (
            <Button onClick={onReset} secondary>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z" clipRule="evenodd" />
                </svg>
              </span>
            </Button>
          )}
        </div>
      )}
      <div 
        ref={timelineContainerRef}
        className={cn(
          "timeline-scrollbar w-full bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a] rounded-lg border border-unfocused-border-color/50 overflow-x-auto overflow-y-auto select-none flex-1 min-h-0 shadow-2xl",
          draggingFromPalette ? "cursor-copy" : "cursor-grab"
        )}
        onDragOver={(e) => {
          if (draggingFromPalette) {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
          }
        }}
        onDrop={(e) => {
          if (draggingFromPalette && paletteDragPreview && onSegmentCreate) {
            e.preventDefault();
            onSegmentCreate(
              draggingFromPalette.type,
              paletteDragPreview.trackId,
              paletteDragPreview.startTime,
              draggingFromPalette.duration
            );
            setPaletteDragPreview(null);
          }
        }}
      >
        {/* Time Ruler */}
      <div 
        className={cn(
          "sticky top-0 z-50 h-14 border-b border-unfocused-border-color/30 select-none bg-gradient-to-b from-[#151515] to-[#0f0f0f] backdrop-blur-sm flex",
          onSeek && "cursor-pointer hover:bg-gradient-to-b hover:from-[#1a1a1a] hover:to-[#151515] transition-colors duration-200"
        )}
        style={{ width: `${timelineWidth}px`, minWidth: "100%", userSelect: "none" }}
      >
        {/* Time Ruler Legend - matches track legend width */}
        <div 
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] border-r border-unfocused-border-color/50 flex items-center justify-center px-2 z-10 shadow-lg backdrop-blur-sm"
          style={{ width: "120px" }}
        >
          <span className="text-xs text-foreground/60 font-semibold tracking-wide uppercase">
            Time
          </span>
        </div>
        
        {/* Time Ruler Content - offset by legend width */}
        <div 
          className="relative ml-[120px] flex-1 h-full"
          style={{ width: `calc(100% - 120px)` }}
          onClick={handleTimelineClick}
        >
          {/* Playhead on ruler */}
          {currentTime >= 0 && currentTime <= totalDuration && (
            <div
              className={cn(
                "absolute top-0 bottom-0 w-[2px] z-20 transition-all duration-100",
                onSeek && "cursor-grab active:cursor-grabbing"
              )}
              style={{
                left: `${playheadPosition}px`,
              }}
              onMouseDown={handlePlayheadMouseDown}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-blue-500 blur-sm opacity-60" />
              {/* Main line */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/50" />
              {/* Playhead handle */}
              <div 
                className={cn(
                  "absolute -top-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-blue-500 drop-shadow-lg transition-transform duration-100",
                  onSeek && "cursor-grab active:cursor-grabbing hover:scale-110 active:scale-95"
                )}
                onMouseDown={handlePlayheadMouseDown}
              />
            </div>
          )}
          <div className="absolute inset-0 flex select-none">
            {timeMarkers.map((time) => (
              <div
                key={time}
                className="relative border-l border-unfocused-border-color/40 select-none group"
                style={{ width: `${pixelsPerSecond}px`, flexShrink: 0, userSelect: "none" }}
              >
                <div 
                  className="absolute top-2 left-1.5 px-1.5 py-0.5 text-xs font-medium text-disabled-text-color/80 select-none rounded bg-black/20 backdrop-blur-sm transition-all duration-200 group-hover:text-foreground/90 group-hover:bg-black/40"
                  style={{ userSelect: "none" }}
                >
                  {formatTime(time)}
                </div>
                <div className="absolute bottom-0 left-0 w-px h-3 bg-gradient-to-b from-unfocused-border-color/60 to-transparent" />
                {/* Minor tick marks */}
                {time < totalDuration && (
                  <>
                    <div className="absolute bottom-0 left-1/4 w-px h-1.5 bg-unfocused-border-color/20" />
                    <div className="absolute bottom-0 left-1/2 w-px h-2 bg-unfocused-border-color/30" />
                    <div className="absolute bottom-0 left-3/4 w-px h-1.5 bg-unfocused-border-color/20" />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline Tracks */}
      <div className="relative">
        {tracks.length > 0 && tracks[0]?.type === "video" && (
          <div
            className="relative border-b-2 border-unfocused-border-color/60 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]"
            style={{
              height: "24px",
              width: `${timelineWidth}px`,
              minWidth: "100%",
            }}
          >
            <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] border-r border-unfocused-border-color/50 flex items-center justify-between px-2 z-10 shadow-lg backdrop-blur-sm"
              style={{ width: "120px" }}
            >
              <span className="text-xs text-foreground/60 font-semibold tracking-wide uppercase">
                Video
              </span>
              {onAddVideoLayer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddVideoLayer();
                  }}
                  className="text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors rounded px-1.5 py-0.5 text-xs font-medium"
                  title="Add Video Layer"
                >
                  +
                </button>
              )}
            </div>
          </div>
        )}
        {tracks.map((track, trackIndex) => {
          const trackHeight =  track.height || 30;
          const sortedSegments = [...track.segments].sort((a, b) => a.start - b.start);
          
          // Check if this is the first audio track (transition from video to audio)
          const isFirstAudioTrack = track.type === "audio" && 
            (trackIndex === 0 || tracks[trackIndex - 1]?.type === "video");

          return (
            <React.Fragment key={track.id}>
              {/* Separator between video and audio groups */}
              {isFirstAudioTrack && (
                <div
                  className="relative border-t-2 border-unfocused-border-color/60 bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f]"
                  style={{
                    height: "24px",
                    width: `${timelineWidth}px`,
                    minWidth: "100%",
                  }}
                >
                  <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] border-r border-unfocused-border-color/50 flex items-center justify-between px-2 z-10 shadow-lg backdrop-blur-sm"
                    style={{ width: "120px" }}
                  >
                    <span className="text-xs text-foreground/60 font-semibold tracking-wide uppercase">
                      Audio
                    </span>
                    {onAddAudioLayer && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddAudioLayer();
                        }}
                        className="text-foreground/60 hover:text-foreground hover:bg-foreground/10 transition-colors rounded px-1.5 py-0.5 text-xs font-medium"
                        title="Add Audio Layer"
                      >
                        +
                      </button>
                    )}
                  </div>
                </div>
              )}
              <div
                className={cn(
                  "relative border-b border-unfocused-border-color/30 select-none transition-colors duration-200",
                  onSeek && "cursor-pointer hover:bg-black/10",
                  draggingFromPalette && "cursor-copy",
                  trackIndex % 2 === 0 ? "bg-[#0f0f0f]/50" : "bg-[#0a0a0a]/50"
                )}
                style={{
                  height: `${trackHeight}px`,
                  width: `${timelineWidth}px`,
                  minWidth: "100%",
                  userSelect: "none",
                }}
                onClick={handleTimelineClick}
                onDragOver={(e) => {
                  if (draggingFromPalette) {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "copy";
                  }
                }}
                onDrop={(e) => {
                  if (draggingFromPalette && paletteDragPreview && onSegmentCreate && paletteDragPreview.trackId === track.id) {
                    e.preventDefault();
                    onSegmentCreate(
                      draggingFromPalette.type,
                      paletteDragPreview.trackId,
                      paletteDragPreview.startTime,
                      draggingFromPalette.duration
                    );
                    setPaletteDragPreview(null);
                  }
                }}
              >
              {/* Track Label */}
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-[#1a1a1a] via-[#1f1f1f] to-[#1a1a1a] border-r border-unfocused-border-color/50 flex items-center justify-between px-2 z-10 shadow-lg backdrop-blur-sm group"
                style={{ width: "120px" }}
              >
                {isRenamingLayer === track.id ? (
                  <input
                    type="text"
                    value={normalizedLayerRenameValue}
                    onChange={(e) => onLayerRenameValueChange?.(e.target.value)}
                    onBlur={() => {
                      if (normalizedLayerRenameValue && onLayerRenameConfirm) {
                        onLayerRenameConfirm(track.id, normalizedLayerRenameValue);
                      } else {
                        onLayerRenameCancel?.();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && normalizedLayerRenameValue && onLayerRenameConfirm) {
                        onLayerRenameConfirm(track.id, normalizedLayerRenameValue);
                      } else if (e.key === "Escape") {
                        onLayerRenameCancel?.();
                      }
                    }}
                    autoFocus
                    className="flex-1 text-xs bg-background text-foreground px-1.5 py-0.5 rounded border border-focused-border-color outline-none"
                  />
                ) : (
                  <>
                    <span 
                      className="text-xs text-foreground/80 font-semibold tracking-wide uppercase flex-1 truncate cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => onStartRenameLayer?.(track.id, track.name)}
                      title="Click to rename"
                    >
                      {track.name}
                    </span>
                    {onLayerDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm(`Delete layer "${track.name}"? All segments on this layer will be removed.`)) {
                            onLayerDelete(track.id);
                          }
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 p-0.5"
                        title="Delete layer"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </>
                )}
              </div>

              {/* Track Content */}
              <div
                className="relative ml-[120px] h-full"
                style={{ width: `calc(100% - 120px)` }}
              >
                {/* Grid lines */}
                <div className="absolute inset-0 flex">
                  {timeMarkers.map((time) => (
                    <div
                      key={time}
                      className="border-l border-unfocused-border-color/20 transition-colors duration-200 hover:border-unfocused-border-color/40"
                      style={{ width: `${pixelsPerSecond}px`, flexShrink: 0 }}
                    />
                  ))}
                </div>

                {/* Playhead line */}
                {currentTime >= 0 && currentTime <= totalDuration && (
                  <div
                    className={cn(
                      "absolute top-0 bottom-0 w-[2px] z-30 transition-all duration-100",
                      onSeek && "cursor-grab active:cursor-grabbing"
                    )}
                    style={{
                      left: `${playheadPosition}px`,
                    }}
                    onMouseDown={handlePlayheadMouseDown}
                  >
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50" />
                    {/* Main line */}
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 shadow-lg shadow-blue-500/40" />
                  </div>
                )}

                {/* Segments Container - Parent with constrained height */}
                <div className="relative h-full" style={{ width: `${timelineWidth}px`, maxHeight: `${trackHeight}px` }}>
                  <div className="relative h-full" style={{ height: `${trackHeight}px` }}>
                  {/* Drag preview indicator - shows where segment will be dropped */}
                  {dragPreview?.trackId === track.id && draggedSegment && (
                    <div
                      className="absolute rounded-lg border-2 border-dashed border-blue-400/80 bg-blue-500/20 z-40 pointer-events-none flex items-center justify-center"
                      style={{
                        left: `${dragPreview.startTime * pixelsPerSecond}px`,
                        width: `${draggedSegment.segment.duration * pixelsPerSecond}px`,
                        minWidth: "80px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="text-xs text-blue-300/80 font-medium">
                        {formatTime(dragPreview.startTime)}
                      </div>
                    </div>
                  )}
                  {/* Palette drag preview indicator - shows where new segment will be created */}
                  {paletteDragPreview?.trackId === track.id && draggingFromPalette && (
                    <div
                      className="absolute rounded-lg border-2 border-dashed border-green-400/80 bg-green-500/20 z-40 pointer-events-none flex items-center justify-center"
                      style={{
                        left: `${paletteDragPreview.startTime * pixelsPerSecond}px`,
                        width: `${draggingFromPalette.duration * pixelsPerSecond}px`,
                        minWidth: "80px",
                        top: "50%",
                        transform: "translateY(-50%)",
                      }}
                    >
                      <div className="text-xs text-green-300/80 font-medium flex items-center gap-1">
                        <span>{draggingFromPalette.type === "text" ? "📝" : draggingFromPalette.type === "code" ? "💻" : draggingFromPalette.type === "audio" ? "🔊" : "🎬"}</span>
                        <span>{formatTime(paletteDragPreview.startTime)}</span>
                      </div>
                    </div>
                  )}
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
                          ? "bg-gradient-to-br from-purple-600 via-purple-500 to-purple-700 border-purple-400/80 shadow-lg shadow-purple-500/30"
                          : "bg-gradient-to-br from-purple-700/90 via-purple-600/80 to-purple-800/90 border-purple-500/60 shadow-md shadow-purple-900/20";
                      } else if (segment.type === "code") {
                        return isSelected
                          ? "bg-gradient-to-br from-blue-600 via-blue-500 to-blue-700 border-blue-400/80 shadow-lg shadow-blue-500/30"
                          : "bg-gradient-to-br from-blue-700/90 via-blue-600/80 to-blue-800/90 border-blue-500/60 shadow-md shadow-blue-900/20";
                      } else if (segment.type === "audio") {
                        return isSelected
                          ? "bg-gradient-to-br from-green-600 via-green-500 to-green-700 border-green-400/80 shadow-lg shadow-green-500/30"
                          : "bg-gradient-to-br from-green-700/90 via-green-600/80 to-green-800/90 border-green-500/60 shadow-md shadow-green-900/20";
                      } else if (segment.type === "gif") {
                        return isSelected
                          ? "bg-gradient-to-br from-orange-600 via-orange-500 to-orange-700 border-orange-400/80 shadow-lg shadow-orange-500/30"
                          : "bg-gradient-to-br from-orange-700/90 via-orange-600/80 to-orange-800/90 border-orange-500/60 shadow-md shadow-orange-900/20";
                      }
                      return "bg-gradient-to-br from-gray-600 via-gray-500 to-gray-700 border-gray-500/60 shadow-md";
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

                    // Handle mouse-based dragging for time/layer changes
                    const handleSegmentMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
                      // Only handle left mouse button
                      if (e.button !== 0) return;
                      
                      // Don't start drag if clicking on delete button
                      if ((e.target as HTMLElement).closest('button')) return;
                      
                      // Reset drag flag at the start of a new drag
                      setHasDragged(false);
                      
                      // Apply active scale
                      e.currentTarget.style.transform = "translateY(-50%) scale(0.98)";
                      
                      if (!onSegmentMove) return;
                      
                      e.preventDefault();
                      e.stopPropagation();
                      
                      // Calculate offset from mouse to segment start (for smooth dragging)
                      const segmentRect = e.currentTarget.getBoundingClientRect();
                      if (!timelineContainerRef.current) return;
                      
                      const containerRect = timelineContainerRef.current.getBoundingClientRect();
                      const scrollLeft = timelineContainerRef.current.scrollLeft;
                      
                      // Offset is the distance from mouse to the left edge of the segment
                      const mouseXInContainer = e.clientX - containerRect.left + scrollLeft;
                      const segmentLeftInContainer = segment.start * pixelsPerSecond;
                      const dragOffset = {
                        x: mouseXInContainer - segmentLeftInContainer,
                        y: e.clientY - segmentRect.top,
                      };
                      
                      setDraggedSegment({
                        trackId: track.id,
                        index: segmentIndex,
                        segment,
                        dragOffset,
                      });
                      
                      document.body.style.userSelect = "none";
                    };

                    // Handle HTML5 drag for reordering (if enabled)
                    const handleDragStart = (e: React.DragEvent) => {
                      if (!onSegmentReorder) return;
                      setDraggedSegment({ 
                        trackId: track.id, 
                        index: segmentIndex,
                        segment,
                        dragOffset: { x: 0, y: 0 }
                      });
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData(
                        "text/plain",
                        `${track.id}:${segmentIndex}`
                      );
                    };

                    const handleDragEnd = () => {
                      // Only clear if it was HTML5 drag (not mouse drag)
                      if (onSegmentReorder && !onSegmentMove) {
                        setDraggedSegment(null);
                        setDragOverSegment(null);
                      }
                    };

                    const handleDragOver = (e: React.DragEvent) => {
                      if (
                        onSegmentReorder &&
                        draggedSegment &&
                        (draggedSegment.trackId !== track.id ||
                          draggedSegment.index !== segmentIndex)
                      ) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDragOverSegment({ trackId: track.id, index: segmentIndex });
                      }
                    };

                    const handleDragLeave = () => {
                      if (onSegmentReorder) {
                        setDragOverSegment(null);
                      }
                    };

                    const handleDrop = (e: React.DragEvent) => {
                      e.preventDefault();
                      if (
                        onSegmentReorder &&
                        draggedSegment &&
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
                    };

                    // Check if this segment is being dragged
                    const isThisSegmentDragging = draggedSegment?.trackId === track.id && 
                                                  draggedSegment?.index === segmentIndex;

                    return (
                      <div
                        key={segmentIndex}
                        draggable={!!onSegmentReorder && !onSegmentMove}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onMouseDown={onSegmentMove ? handleSegmentMouseDown : (e: React.MouseEvent<HTMLDivElement>) => {
                          e.currentTarget.style.transform = "translateY(-50%) scale(0.98)";
                        }}
                        onMouseUp={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.currentTarget.style.transform = "translateY(-50%)";
                        }}
                        className={cn(
                          "absolute rounded-lg cursor-pointer transition-all duration-200 ease-out",
                          "border-2 flex items-center gap-2.5 px-4 overflow-hidden backdrop-blur-sm",
                          "hover:shadow-xl hover:brightness-110",
                          isThisSegmentDragging && "opacity-40 z-50",
                          isDragOver && "ring-4 ring-yellow-400/60 ring-offset-2 ring-offset-black/50",
                          isSelected && !isThisSegmentDragging && "ring-2 ring-white/30 ring-offset-2 ring-offset-transparent",
                          getSegmentColor()
                        )}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                          minWidth: "80px", 
                          padding: "8px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          cursor: (onSegmentReorder || onSegmentMove) ? "grab" : "pointer",
                        }}
                        onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                          if (!isThisSegmentDragging) {
                            e.currentTarget.style.transform = "translateY(-50%) scale(1.02)";
                          }
                        }}
                        onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                          e.currentTarget.style.transform = "translateY(-50%)";
                        }}
                        onClick={(e) => {
                          // Don't open edit modal if this segment was just dragged or if we've dragged
                          if (hasDragged || isThisSegmentDragging || isDragging) {
                            return;
                          }
                          e.stopPropagation();
                          onSegmentClick(segment, track.id, segmentIndex);
                        }}
                        title={`${getSegmentLabel()}: ${formatTime(segment.start)} - ${formatTime(segment.start + segment.duration)}${onSegmentReorder ? " (Drag to reorder)" : ""}`}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-xl drop-shadow-lg filter brightness-110">{getSegmentIcon()}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-white truncate drop-shadow-sm">
                              {getSegmentLabel()}
                            </div>
                            <div className="text-xs text-white/80 truncate mt-0.5 font-medium">
                              {getSegmentSubLabel()}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSegmentDelete(track.id, segmentIndex);
                          }}
                          className="text-white/60 hover:text-white hover:bg-white/10 transition-all duration-200 rounded-md px-2 py-1 flex items-center justify-center min-w-[24px] h-6 group"
                          title="Delete segment"
                        >
                          <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    );
                  })}
                  </div>
                </div>

                {track.segments.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-disabled-text-color/50 text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      No segments
                    </span>
                  </div>
                )}
              </div>
            </div>
            </React.Fragment>
          );
        })}
      </div>
      </div>
    </div>
  );
};

