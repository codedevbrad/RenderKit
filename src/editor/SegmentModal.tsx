"use client";

import React, { useState, useEffect } from "react";
import { Button } from "../components/Button";
import { Modal } from "../components/Modal";
import { Spacing } from "../components/Spacing";
import { Segment, Layer } from "../../types/constants";
import { cn } from "../lib/utils";
import { GiphyPicker } from "../components/GiphyPicker";

interface SegmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (segment: Segment) => void;
  segment?: Segment | null;
  defaultStart?: number;
  layers?: Layer[];
  defaultLayerId?: string | null;
}

export const SegmentModal: React.FC<SegmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  segment,
  defaultStart = 0,
  layers = [],
  defaultLayerId = null,
}) => {
  const [segmentType, setSegmentType] = useState<"text" | "code" | "audio" | "gif">("text");
  const [start, setStart] = useState(0);
  const [duration, setDuration] = useState(3);
  const [fadeIn, setFadeIn] = useState(0.5);
  const [fadeOut, setFadeOut] = useState(0.5);
  const [text, setText] = useState("");
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [audioUrl, setAudioUrl] = useState("");
  const [audioName, setAudioName] = useState("");
  const [volume, setVolume] = useState(1);
  const [audioFileName, setAudioFileName] = useState("");
  const [isLoadingDuration, setIsLoadingDuration] = useState(false);
  const [gifUrl, setGifUrl] = useState("");
  const [gifName, setGifName] = useState("");
  const [selectedLayerId, setSelectedLayerId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"settings" | "content">("settings");

  useEffect(() => {
    if (segment) {
      setSegmentType(segment.type);
      setStart(segment.start);
      setDuration(segment.duration);
      setFadeIn(segment.fadeIn);
      setFadeOut(segment.fadeOut);
      setSelectedLayerId(segment.layerId);
      if (segment.type === "text") {
        setText(segment.text);
      } else if (segment.type === "code") {
        setCode(segment.code);
        setLanguage(segment.language);
      } else if (segment.type === "audio") {
        setAudioUrl(segment.audioUrl);
        setVolume(segment.volume);
        setAudioName(segment.name || "");
        // If it's a blob URL, we can't restore the file, so just show the URL
        if (segment.audioUrl.startsWith("blob:")) {
          setAudioFileName("Uploaded audio file");
        }
      } else if (segment.type === "gif") {
        setGifUrl(segment.gifUrl);
        setGifName(segment.name || "");
      }
    } else {
      // Reset to defaults for new segment (only when modal opens or segment changes)
      setSegmentType("text");
      setStart(defaultStart);
      setDuration(3);
      setFadeIn(0.5);
      setFadeOut(0.5);
      setText("");
      setCode("// Your code here");
      setLanguage("javascript");
      setAudioUrl("");
      setAudioName("");
      setVolume(1);
      setAudioFileName("");
      setGifUrl("");
      setGifName("");
      // Set default layer - prefer defaultLayerId if it matches segment type, then first matching type layer
      const matchingTypeLayers = layers.filter(l => l.type === "video");
      
      let targetLayer;
      if (defaultLayerId) {
        const defaultLayer = layers.find(l => l.id === defaultLayerId);
        // Use defaultLayerId if it's a video layer (default segment type is text)
        if (defaultLayer && defaultLayer.type === "video") {
          targetLayer = defaultLayer;
        }
      }
      // Fall back to first matching type layer
      if (!targetLayer && matchingTypeLayers.length > 0) {
        targetLayer = matchingTypeLayers[0];
      }
      setSelectedLayerId(targetLayer?.id || "");
    }
  }, [segment, defaultStart, isOpen, defaultLayerId, layers]);

  // Handle segment type change
  const handleSegmentTypeChange = (newType: "text" | "code" | "audio" | "gif") => {
    setSegmentType(newType);
    
    // Clear fields that don't belong to the new type
    if (newType !== "text") {
      setText("");
    }
    if (newType !== "code") {
      setCode("// Your code here");
      setLanguage("javascript");
    }
    if (newType !== "audio") {
      // Revoke blob URL if it exists
      if (audioUrl && audioUrl.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl("");
      setAudioName("");
      setAudioFileName("");
      setVolume(1);
    }
    if (newType !== "gif") {
      setGifUrl("");
      setGifName("");
    }
    
    // Auto-select appropriate layer
    if (newType === "audio") {
      const audioLayer = layers.find(l => l.type === "audio");
      if (audioLayer) setSelectedLayerId(audioLayer.id);
    } else {
      const videoLayer = layers.find(l => l.type === "video");
      if (videoLayer) setSelectedLayerId(videoLayer.id);
    }
  };

  // Handle GIF selection from GIPHY picker
  const handleGifSelect = (url: string, title: string) => {
    setGifUrl(url);
    if (!gifName) {
      setGifName(title || "GIPHY GIF");
    }
  };

  // Handle audio file upload
  const handleAudioFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("audio/")) {
      alert("Please select an audio file");
      return;
    }

    // Revoke previous blob URL if it exists
    if (audioUrl && audioUrl.startsWith("blob:")) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioFileName(file.name);
    setIsLoadingDuration(true);

    // Create object URL for the file
    const objectUrl = URL.createObjectURL(file);
    setAudioUrl(objectUrl);
    
    // Set name from filename if not already set
    if (!audioName) {
      setAudioName(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }

    // Get audio duration
    const audio = new Audio(objectUrl);
    audio.addEventListener("loadedmetadata", () => {
      const durationInSeconds = audio.duration;
      if (durationInSeconds && isFinite(durationInSeconds)) {
        setDuration(durationInSeconds);
      }
      setIsLoadingDuration(false);
    });
    audio.addEventListener("error", () => {
      setIsLoadingDuration(false);
      alert("Error loading audio file");
    });
  };

  const handleSave = () => {
    // For audio segments, we need to ensure we have a valid URL
    if (segmentType === "audio" && !audioUrl) {
      alert("Please upload an audio file");
      return;
    }

    // For GIF segments, we need to ensure we have a valid URL
    if (segmentType === "gif" && !gifUrl) {
      alert("Please paste or upload a GIF file");
      return;
    }

    if (!selectedLayerId) {
      alert("Please select a layer");
      return;
    }

    const newSegment: Segment =
      segmentType === "text"
        ? {
            type: "text",
            start,
            duration,
            text,
            fadeIn,
            fadeOut,
            layerId: selectedLayerId,
          }
        : segmentType === "code"
        ? {
            type: "code",
            start,
            duration,
            code,
            language,
            fadeIn,
            fadeOut,
            layerId: selectedLayerId,
          }
        : segmentType === "audio"
        ? {
            type: "audio",
            start,
            duration,
            audioUrl,
            name: audioName || undefined,
            volume,
            fadeIn,
            fadeOut,
            layerId: selectedLayerId,
          }
        : {
            type: "gif",
            start,
            duration,
            gifUrl,
            name: gifName || undefined,
            fadeIn,
            fadeOut,
            layerId: selectedLayerId,
          };
    onSave(newSegment);
    onClose();
  };

  // Filter layers based on segment type
  const availableLayers = layers.filter(layer => {
    if (segmentType === "audio") {
      return layer.type === "audio";
    } else {
      return layer.type === "video";
    }
  });

  // Update selected layer when segment type changes (for new segments only)
  useEffect(() => {
    if (!segment && availableLayers.length > 0) {
      const currentSelected = availableLayers.find(l => l.id === selectedLayerId);
      if (!currentSelected) {
        // Current selection is not valid for this segment type, select first available
        setSelectedLayerId(availableLayers[0].id);
      }
    }
  }, [segmentType, segment, availableLayers, selectedLayerId]);

  // Reset to settings tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab("settings");
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={segment ? "Edit Segment" : "Create Segment"}
    >
      <div className="space-y-4">
        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-unfocused-border-color">
          <button
            onClick={() => setActiveTab("settings")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "settings"
                ? "text-foreground border-foreground"
                : "text-disabled-text-color border-transparent hover:text-foreground"
            )}
          >
            Settings
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "content"
                ? "text-foreground border-foreground"
                : "text-disabled-text-color border-transparent hover:text-foreground"
            )}
          >
            Content
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-4">
            {/* Layer Selection */}
            {availableLayers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Layer
                </label>
                <select
                  value={selectedLayerId}
                  onChange={(e) => setSelectedLayerId(e.target.value)}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                >
                  {availableLayers.map((layer) => (
                    <option key={layer.id} value={layer.id}>
                      {layer.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Segment Type Toggle */}
            {!segment && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Segment Type
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSegmentTypeChange("text")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-geist border transition-colors",
                      segmentType === "text"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color"
                    )}
                  >
                    📝 Text
                  </button>
                  <button
                    onClick={() => handleSegmentTypeChange("code")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-geist border transition-colors",
                      segmentType === "code"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color"
                    )}
                  >
                    💻 Code
                  </button>
                  <button
                    onClick={() => handleSegmentTypeChange("audio")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-geist border transition-colors",
                      segmentType === "audio"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color"
                    )}
                  >
                    🔊 Audio
                  </button>
                  <button
                    onClick={() => handleSegmentTypeChange("gif")}
                    className={cn(
                      "flex-1 px-4 py-2 rounded-geist border transition-colors",
                      segmentType === "gif"
                        ? "bg-foreground text-background border-foreground"
                        : "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color"
                    )}
                  >
                    🎬 GIF
                  </button>
                </div>
              </div>
            )}
            {segment && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Segment Type
                </label>
                <div className="px-4 py-2 rounded-geist border border-unfocused-border-color bg-background text-foreground">
                  {segmentType === "text" && "📝 Text"}
                  {segmentType === "code" && "💻 Code"}
                  {segmentType === "audio" && "🔊 Audio"}
                  {segmentType === "gif" && "🎬 GIF"}
                </div>
              </div>
            )}

            {/* Timing Controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start (seconds)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={start}
                  onChange={(e) => setStart(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Duration (seconds)
                  {segmentType === "audio" && isLoadingDuration && (
                    <span className="ml-2 text-xs text-disabled-text-color">
                      (Auto-detecting...)
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={duration}
                  onChange={(e) => setDuration(parseFloat(e.target.value) || 0)}
                  disabled={segmentType === "audio" && isLoadingDuration}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Fade In (seconds)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fadeIn}
                  onChange={(e) => setFadeIn(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Fade Out (seconds)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={fadeOut}
                  onChange={(e) => setFadeOut(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="space-y-4">
            {segmentType === "text" ? (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Text
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none resize-none"
                  placeholder="Enter your text here..."
                />
              </div>
            ) : segmentType === "code" ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                    placeholder="javascript, python, etc."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Code
                  </label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={12}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none font-mono resize-none"
                    placeholder="// Your code here"
                  />
                </div>
              </>
            ) : segmentType === "gif" ? (
              <>
                <GiphyPicker 
                  onSelect={handleGifSelect} 
                  selectedUrl={gifUrl}
                  defaultCollapsed={!!segment}
                />
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={gifName}
                    onChange={(e) => setGifName(e.target.value)}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                    placeholder="Enter a name for this GIF segment"
                  />
                </div>
                {gifUrl && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Or enter custom URL
                    </label>
                    <input
                      type="text"
                      value={gifUrl}
                      onChange={(e) => setGifUrl(e.target.value)}
                      className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                      placeholder="https://example.com/image.gif"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Audio File
                  </label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioFileChange}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none file:mr-4 file:py-2 file:px-4 file:rounded-geist file:border-0 file:text-sm file:font-semibold file:bg-foreground file:text-background hover:file:bg-background hover:file:text-foreground"
                  />
                  {audioFileName && (
                    <div className="mt-2 text-sm text-disabled-text-color">
                      Selected: {audioFileName}
                      {isLoadingDuration && " (Loading duration...)"}
                    </div>
                  )}
                  {audioUrl && !audioFileName && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Or enter URL
                      </label>
                      <input
                        type="text"
                        value={audioUrl}
                        onChange={(e) => setAudioUrl(e.target.value)}
                        className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                        placeholder="https://example.com/audio.mp3"
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={audioName}
                    onChange={(e) => setAudioName(e.target.value)}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                    placeholder="Enter a name for this audio segment"
                  />
                </div>
                {audioUrl && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">
                      Preview Audio
                    </label>
                    <audio
                      controls
                      src={audioUrl}
                      className="w-full"
                      style={{ maxHeight: "60px" }}
                    >
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">
                    Volume (0-1)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value) || 0)}
                    className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
                  />
                </div>
              </>
            )}
          </div>
        )}

        <Spacing></Spacing>
        <div className="flex justify-end gap-2">
          <Button secondary onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Segment</Button>
        </div>
      </div>
    </Modal>
  );
};

