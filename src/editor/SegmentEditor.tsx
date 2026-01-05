"use client";

import React, { useState, useMemo } from "react";
import { Segment, Layer } from "../../types/constants";
import { Timeline, Track } from "../components/Timeline";
import { SegmentModal } from "./SegmentModal";
import { Button } from "../components/Button";

interface SegmentEditorProps {
  segments: Segment[];
  onSegmentsChange: (segments: Segment[]) => void;
  layers: Layer[];
  onLayersChange: (layers: Layer[]) => void;
  currentTime?: number;
  onPlay?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onSeek?: (timeInSeconds: number) => void;
}

export const SegmentEditor: React.FC<SegmentEditorProps> = ({
  segments,
  onSegmentsChange,
  layers,
  onLayersChange,
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
  const [editingLayerId, setEditingLayerId] = useState<string | null>(null);
  const [isRenamingLayer, setIsRenamingLayer] = useState<string | null>(null);
  const [layerRenameValue, setLayerRenameValue] = useState("");
  const [draggingFromPalette, setDraggingFromPalette] = useState<{ type: "text" | "code" | "audio" | "gif"; duration: number } | null>(null);

  // Organize segments into tracks based on layers, grouped by type
  const tracks = useMemo((): Track[] => {
    // Separate layers by type
    const videoLayers = layers.filter(l => l.type === "video").sort((a, b) => a.order - b.order);
    const audioLayers = layers.filter(l => l.type === "audio").sort((a, b) => a.order - b.order);
    
    // Combine: video layers first, then audio layers
    const groupedLayers = [...videoLayers, ...audioLayers];
    
    return groupedLayers.map((layer) => {
      const layerSegments = segments.filter((seg) => seg.layerId === layer.id);
      return {
        id: layer.id,
        name: layer.name,
        segments: layerSegments,
        height: layer.type === "video" ? 120 : 80,
        type: layer.type, // Add type to track for grouping visualization
      };
    });
  }, [segments, layers]);

  const defaultStart = useMemo(() => {
    if (segments.length === 0) return 0;
    const lastSegment = segments[segments.length - 1];
    return lastSegment.start + lastSegment.duration + 0.5;
  }, [segments]);

  const handleAddSegment = () => {
    setEditingSegment(null);
    setEditingTrackId(null);
    setEditingIndex(null);
    // Default to first video layer if available, otherwise first layer
    const defaultLayer = layers.find(l => l.type === "video") || layers[0];
    setEditingLayerId(defaultLayer?.id || null);
    setIsModalOpen(true);
  };

  const handleAddLayer = (type: "video" | "audio") => {
    const maxOrder = layers.length > 0 ? Math.max(...layers.map(l => l.order)) : -1;
    const newLayer: Layer = {
      id: `${type}-${Date.now()}`,
      name: `${type === "video" ? "Video" : "Audio"} Layer ${layers.filter(l => l.type === type).length + 1}`,
      type,
      order: maxOrder + 1,
    };
    onLayersChange([...layers, newLayer]);
  };

  const handleDeleteLayer = (layerId: string) => {
    if (layers.length <= 1) {
      alert("Cannot delete the last layer");
      return;
    }
    
    // Remove segments from this layer
    const updatedSegments = segments.filter(seg => seg.layerId !== layerId);
    onSegmentsChange(updatedSegments);
    
    // Remove the layer
    const updatedLayers = layers.filter(l => l.id !== layerId);
    onLayersChange(updatedLayers);
  };

  const handleRenameLayer = (layerId: string, newName: string) => {
    if (!newName.trim()) return;
    const updatedLayers = layers.map(l => 
      l.id === layerId ? { ...l, name: newName.trim() } : l
    );
    onLayersChange(updatedLayers);
    setIsRenamingLayer(null);
    setLayerRenameValue("");
  };

  const startRenamingLayer = (layerId: string, currentName: string) => {
    setIsRenamingLayer(layerId);
    setLayerRenameValue(currentName);
  };

  const handleEditSegment = (segment: Segment, trackId: string, index: number) => {
    setEditingSegment(segment);
    setEditingTrackId(trackId);
    setEditingIndex(index);
    setEditingLayerId(segment.layerId);
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
          // Segment already has the correct layerId from the modal
          updated[globalIndex] = segment;
          onSegmentsChange(updated);
        }
      }
    } else {
      // Add new segment - segment already has layerId from the modal
      if (!segment.layerId) {
        alert("Please select a layer");
        return;
      }
      onSegmentsChange([...segments, segment]);
    }
    setEditingSegment(null);
    setEditingTrackId(null);
    setEditingIndex(null);
    setEditingLayerId(null);
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

    // Update layerId if moving between different layers
    const movedWithNewLayer = fromTrackId !== toTrackId 
      ? { ...moved, layerId: toTrackId }
      : moved;

    if (fromTrackId === toTrackId) {
      // Reordering within same track
      const toSegment = toTrack.segments[toIndex];
      const toGlobalIndex = segments.findIndex((s) => s === toSegment);
      if (toGlobalIndex !== -1) {
        updated.splice(toGlobalIndex, 0, movedWithNewLayer);
      }
    } else {
      // Moving between tracks - find insertion point
      const toSegment = toTrack.segments[toIndex];
      const toGlobalIndex = segments.findIndex((s) => s === toSegment);
      if (toGlobalIndex !== -1) {
        updated.splice(toGlobalIndex, 0, movedWithNewLayer);
      } else {
        // Append to end if track is empty
        updated.push(movedWithNewLayer);
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

  const handleSegmentMove = (segment: Segment, newLayerId: string, newStartTime: number) => {
    const globalIndex = segments.findIndex((s) => s === segment);
    if (globalIndex === -1) return;

    const updated = [...segments];
    updated[globalIndex] = {
      ...segment,
      layerId: newLayerId,
      start: newStartTime,
    };

    onSegmentsChange(updated);

    // Update selected segment if it was the moved one
    const track = tracks.find((t) => t.id === newLayerId);
    if (track) {
      const newIndex = track.segments.findIndex((s) => s === segment);
      if (newIndex !== -1) {
        setSelectedSegment({ trackId: newLayerId, index: newIndex });
      }
    }
  };

  const handleSegmentCreate = (type: "text" | "code" | "audio" | "gif", layerId: string, startTime: number, duration: number) => {
    // Find appropriate layer if the provided one doesn't match the segment type
    const targetLayer = layers.find(l => l.id === layerId) || 
      (type === "audio" 
        ? layers.find(l => l.type === "audio") 
        : layers.find(l => l.type === "video")) ||
      layers[0];
    
    if (!targetLayer) return;

    // Create default segment based on type
    const newSegment: Segment = 
      type === "text"
        ? {
            type: "text",
            start: startTime,
            duration,
            text: "New text segment",
            fadeIn: 0.5,
            fadeOut: 0.5,
            layerId: targetLayer.id,
          }
        : type === "code"
        ? {
            type: "code",
            start: startTime,
            duration,
            code: "// Your code here",
            language: "javascript",
            fadeIn: 0.5,
            fadeOut: 0.5,
            layerId: targetLayer.id,
          }
        : type === "audio"
        ? {
            type: "audio",
            start: startTime,
            duration,
            audioUrl: "",
            volume: 1,
            fadeIn: 0.5,
            fadeOut: 0.5,
            layerId: targetLayer.id,
          }
        : {
            type: "gif",
            start: startTime,
            duration,
            gifUrl: "",
            fadeIn: 0.5,
            fadeOut: 0.5,
            layerId: targetLayer.id,
          };
    
    onSegmentsChange([...segments, newSegment]);
    setDraggingFromPalette(null);
  };

  return (
    <div className="w-full shadow-md bg-black p-4 flex flex-col h-full min-h-0 rounded-lg">
      <div className="flex items-center justify-between mb-3 flex-shrink-0 gap-2">
        <h2 className="text-xl font-bold text-white">Timeline</h2>
        
        <div className="flex items-center gap-2">
          {/* Draggable Segment Type Icons */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-unfocused-border-color/50">
            <span className="text-xs text-foreground/60 mr-1">Drag to add:</span>
            {(["text", "code", "audio", "gif"] as const).map((type) => {
              const getIcon = () => {
                if (type === "text") return "📝";
                if (type === "code") return "💻";
                if (type === "audio") return "🔊";
                if (type === "gif") return "🎬";
                return "📄";
              };
              
              const getLabel = () => {
                if (type === "text") return "Text";
                if (type === "code") return "Code";
                if (type === "audio") return "Audio";
                if (type === "gif") return "GIF";
                return "Segment";
              };

              const defaultDuration = type === "audio" ? 5 : 3;

              return (
                <div
                  key={type}
                  draggable
                  onDragStart={(e) => {
                    setDraggingFromPalette({ type, duration: defaultDuration });
                    e.dataTransfer.effectAllowed = "copy";
                    e.dataTransfer.setData("segment-type", type);
                    document.body.style.userSelect = "none";
                  }}
                  onDragEnd={() => {
                    // Only clear if we didn't successfully drop (check if drop was prevented)
                    // The drop handler will clear the state, but if drag ends without drop, clear it here
                    setTimeout(() => {
                      setDraggingFromPalette(null);
                      document.body.style.userSelect = "";
                    }, 100);
                  }}
                  className="flex flex-col items-center gap-1 px-2 py-1.5 rounded cursor-grab active:cursor-grabbing hover:bg-foreground/10 transition-colors group"
                  title={`Drag ${getLabel()} segment to timeline`}
                >
                  <span className="text-2xl drop-shadow-lg">{getIcon()}</span>
                  <span className="text-xs text-foreground/70 group-hover:text-foreground transition-colors">{getLabel()}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">
        <Timeline
          tracks={tracks}
          onSegmentClick={handleEditSegment}
          onSegmentDelete={handleDeleteSegment}
          onSegmentReorder={handleReorderSegments}
          onSegmentMove={handleSegmentMove}
          onSegmentCreate={handleSegmentCreate}
          selectedSegment={selectedSegment}
          currentTime={currentTime}
          onPlay={onPlay}
          onPause={onPause}
          onReset={onReset}
          onSeek={onSeek}
          onLayerDelete={handleDeleteLayer}
          onStartRenameLayer={startRenamingLayer}
          isRenamingLayer={isRenamingLayer}
          layerRenameValue={layerRenameValue ?? ""}
          onLayerRenameValueChange={setLayerRenameValue}
          onLayerRenameConfirm={handleRenameLayer}
          onLayerRenameCancel={() => {
            setIsRenamingLayer(null);
            setLayerRenameValue("");
          }}
          onAddVideoLayer={() => handleAddLayer("video")}
          onAddAudioLayer={() => handleAddLayer("audio")}
          draggingFromPalette={draggingFromPalette}
        />
      </div>

      <SegmentModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSegment(null);
          setEditingTrackId(null);
          setEditingIndex(null);
          setEditingLayerId(null);
        }}
        onSave={handleSaveSegment}
        segment={editingSegment}
        defaultStart={defaultStart}
        layers={layers}
        defaultLayerId={editingLayerId}
      />
    </div>
  );
};

