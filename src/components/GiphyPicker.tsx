"use client";

import React, { useState, useEffect, useCallback } from "react";
import { cn } from "../lib/utils";

interface GiphyGif {
  id: string;
  title: string;
  images: {
    original: {
      url: string;
    };
    fixed_height: {
      url: string;
    };
  };
}

interface GiphyResponse {
  data: GiphyGif[];
  pagination: {
    total_count: number;
    count: number;
    offset: number;
  };
}

interface GiphyPickerProps {
  onSelect: (gifUrl: string, title: string) => void;
  selectedUrl?: string;
  defaultCollapsed?: boolean;
}

// GIPHY API Key - Get your own at https://developers.giphy.com/
// Set NEXT_PUBLIC_GIPHY_API_KEY in your .env.local file
const GIPHY_API_KEY = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "GlVGYHkr3WSBnllca54iNt0yFbjz7L65"; // Public demo key (rate limited)

export const GiphyPicker: React.FC<GiphyPickerProps> = ({
  onSelect,
  selectedUrl,
  defaultCollapsed = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(!defaultCollapsed);
  const [searchQuery, setSearchQuery] = useState("");
  const [gifs, setGifs] = useState<GiphyGif[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchGifs = useCallback(
    async (query: string = "", currentOffset: number = 0) => {
      setIsLoading(true);
      setError(null);

      try {
        const endpoint = query
          ? `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=20&offset=${currentOffset}`
          : `https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}&limit=20&offset=${currentOffset}`;

        const response = await fetch(endpoint);
        if (!response.ok) {
          throw new Error("Failed to fetch GIFs from GIPHY");
        }

        const data: GiphyResponse = await response.json();
        
        if (currentOffset === 0) {
          setGifs(data.data);
        } else {
          setGifs((prev) => [...prev, ...data.data]);
        }

        setHasMore(
          data.pagination.offset + data.pagination.count <
            data.pagination.total_count
        );
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load GIFs");
        console.error("GIPHY API error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Load trending GIFs on mount only if expanded
  useEffect(() => {
    if (isExpanded) {
      fetchGifs();
    }
  }, [isExpanded, fetchGifs]);

  // Debounced search (only when expanded)
  useEffect(() => {
    if (!isExpanded) return;
    
    const timeoutId = setTimeout(() => {
      setOffset(0);
      fetchGifs(searchQuery, 0);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, fetchGifs, isExpanded]);

  const handleLoadMore = () => {
    const newOffset = offset + 20;
    setOffset(newOffset);
    fetchGifs(searchQuery, newOffset);
  };

  const handleGifClick = (gif: GiphyGif) => {
    // Use the original URL for best quality
    onSelect(gif.images.original.url, gif.title);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-foreground">
          GIPHY Search
        </label>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "px-3 py-1 rounded-geist border transition-colors text-sm",
            "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color"
          )}
        >
          {isExpanded ? "▼ Collapse" : "▶ Expand"}
        </button>
      </div>

      {isExpanded && (
        <>
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for GIFs..."
              className="w-full rounded-geist bg-background p-2 text-foreground text-sm border border-unfocused-border-color focus:border-focused-border-color outline-none"
            />
            {!process.env.NEXT_PUBLIC_GIPHY_API_KEY && (
              <p className="mt-1 text-xs text-disabled-text-color">
                Using demo API key (rate limited). Get your own at{" "}
                <a
                  href="https://developers.giphy.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  developers.giphy.com
                </a>{" "}
                and set NEXT_PUBLIC_GIPHY_API_KEY in .env.local
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-geist bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="max-h-96 overflow-y-auto border border-unfocused-border-color rounded-geist p-2">
            {isLoading && gifs.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-disabled-text-color">
                Loading GIFs...
              </div>
            ) : gifs.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-disabled-text-color">
                No GIFs found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {gifs.map((gif) => (
                    <div
                      key={gif.id}
                      onClick={() => handleGifClick(gif)}
                      className={cn(
                        "relative cursor-pointer rounded-geist overflow-hidden border-2 transition-all hover:scale-105",
                        selectedUrl === gif.images.original.url
                          ? "border-blue-500 ring-2 ring-blue-500/50"
                          : "border-unfocused-border-color hover:border-focused-border-color"
                      )}
                    >
                      <img
                        src={gif.images.fixed_height.url}
                        alt={gif.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      {selectedUrl === gif.images.original.url && (
                        <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {hasMore && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      className={cn(
                        "px-4 py-2 rounded-geist border transition-colors",
                        "bg-background text-foreground border-unfocused-border-color hover:border-focused-border-color",
                        isLoading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      {isLoading ? "Loading..." : "Load More"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}

      {selectedUrl && (
        <div className="mt-4">
          <label className="block text-sm font-medium text-foreground mb-2">
            Selected GIF Preview
          </label>
          <div className="border border-unfocused-border-color rounded-geist p-2 bg-background">
            <img
              src={selectedUrl}
              alt="Selected GIF"
              className="max-w-full max-h-48 mx-auto"
            />
          </div>
        </div>
      )}
    </div>
  );
};

