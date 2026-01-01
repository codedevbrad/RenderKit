"use client";

import React, { useState, useMemo } from "react";
import { Button } from "./Button";
import { Segment } from "../../types/constants";
import { Timeline, Track } from "./Timeline";
import { SegmentModal } from "./SegmentModal";

interface SegmentEditorProps {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSeek?: (timeInSeconds: number) => void;
}

export const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segments,
  onSegmentsChange,
  currentTime = 0,
  onPlay,
  onPause,
  onReset,
  onSeek,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSegment, setEditingSegment] = useState<Segment | null>(null);
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<{ trackId: string; index: number } | null>(null);

  // Organize segments into tracks
  const tracks = useMemo((): Track[] => {
    const videoSegments = segments.filter(
      (seg) => seg.type === "text" || seg.type === "code" || seg.type === "gif"
    );
    const audioSegments = segments.filter((seg) => seg.type === "audio");

    return [
      {
        id: "video",
        name: "Video",
        segments: videoSegments,
        height: 120,
      },
      {
        id: "audio",
        name: "Audio",
        segments: audioSegments,
        height: 80,
      },
    ];
  }, [segments]);

  const defaultStart = useMemo(() => {
    if (segments.length === 0) return 0;
    const lastSegment = segments[segments.length - 1];
    return lastSegment.start + lastSegment.duration + 0.5;
  }, [segments]);

  const handleAddSegment = () => {
    setEditingSegment(null);
    setEditingTrackId(null);
    setEditingIndex(null);
    setIsModalOpen(true);
  };

  const handleEditSegment = (segment: Segment, trackId: string, index: number) => {
    setEditingSegment(segment);
    setEditingTrackId(trackId);
    setEditingIndex(index);
    setSelectedSegment({ trackId, index });
    setIsModalOpen(true);
  };

  const handleSaveSegment = (segment: Segment) => {
    if (editingIndex !== null && editingTrackId !== null) {
      // Update existing segment - find it in the segments array
      const track = tracks.find((t) => t.id === editingTrackId);
      if (track) {
        const segmentInArray = track.segments[editingIndex];
        const globalIndex = segments.findIndex((s) => s === segmentInArray);
        if (globalIndex !== -1) {
          const updated = [...segments];
          updated[globalIndex] = segment;
          onSegmentsChange(updated);
        }
      }
    } else {
      // Add new segment
      onSegmentsChange([...segments, segment]);
    }
    setEditingSegment(null);
    setEditingTrackId(null);
    setEditingIndex(null);
  };

  const handleDeleteSegment = (trackId: string, index: number) => {
    const track = tracks.find((t) => t.id === trackId);
    if (track) {
      const segmentToDelete = track.segments[index];
      const globalIndex = segments.findIndex((s) => s === segmentToDelete);
      if (globalIndex !== -1) {
        const updated = segments.filter((_, i) => i !== globalIndex);
        onSegmentsChange(updated);
        if (
          selectedSegment?.trackId === trackId &&
          selectedSegment?.index === index
        ) {
          setSelectedSegment(null);
        }
      }
    }
  };

  const handleReorderSegments = (
    fromTrackId: string,
    fromIndex: number,
    toTrackId: string,
    toIndex: number
  ) => {
    const fromTrack = tracks.find((t) => t.id === fromTrackId);
    const toTrack = tracks.find((t) => t.id === toTrackId);
    
    if (!fromTrack || !toTrack) return;

    const segmentToMove = fromTrack.segments[fromIndex];
    const fromGlobalIndex = segments.findIndex((s) => s === segmentToMove);

    if (fromGlobalIndex === -1) return;

    const updated = [...segments];
    const [moved] = updated.splice(fromGlobalIndex, 1);

    if (fromTrackId === toTrackId) {
      // Reordering within same track
      const toSegment = toTrack.segments[toIndex];
      const toGlobalIndex = segments.findIndex((s) => s === toSegment);
      if (toGlobalIndex !== -1) {
        updated.splice(toGlobalIndex, 0, moved);
      }
    } else {
      // Moving between tracks - find insertion point
      const toSegment = toTrack.segments[toIndex];
      const toGlobalIndex = segments.findIndex((s) => s === toSegment);
      if (toGlobalIndex !== -1) {
        updated.splice(toGlobalIndex, 0, moved);
      } else {
        // Append to end if track is empty
        updated.push(moved);
      }
    }

    onSegmentsChange(updated);

    // Update selected segment
    if (
      selectedSegment?.trackId === fromTrackId &&
      selectedSegment?.index === fromIndex
    ) {
      setSelectedSegment({ trackId: toTrackId, index: toIndex });
    }
  };

  return (
    <div className="w-full bg-gray-900 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Timeline</h2>
        <Button onClick={handleAddSegment}>Add Segment</Button>
      </div>

      <Timeline
        tracks={tracks}
        onSegmentClick={handleEditSegment}
        onSegmentDelete={handleDeleteSegment}
        onSegmentReorder={handleReorderSegments}
        selectedSegment={selectedSegment}
        currentTime={currentTime}
        onPlay={onPlay}
        onPause={onPause}
        onReset={onReset}
        onSeek={onSeek}
      />

      <SegmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSegment(null);
          setEditingTrackId(null);
          setEditingIndex(null);
        }}
        onSave={handleSaveSegment}
        segment={editingSegment}
        defaultStart={defaultStart}
      />
    </div>
  );
};

