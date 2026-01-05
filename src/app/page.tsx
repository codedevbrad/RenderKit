"use client";

import Link from "next/link";
import { Button } from "../components/Button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-0 overflow-auto">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center text-center px-6 py-12 max-w-4xl mx-auto">
        {/* Logo Animation */}
        <div className="relative w-24 h-24 flex-shrink-0 mb-8 animate-pulse">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-blue-400 shadow-lg shadow-blue-400/50"></div>
          <div className="absolute bottom-0 left-0 w-12 h-12 rounded-full bg-orange-500 shadow-lg shadow-orange-500/50"></div>
          <div className="absolute bottom-0 right-0 w-12 h-12 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
        </div>

        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
          RenderKit
        </h1>
        
        {/* Subtitle */}
        <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
          Create stunning videos with ease
        </p>
        
        {/* Description */}
        <p className="text-lg text-gray-400 mb-12 max-w-2xl leading-relaxed">
          Professional video editing powered by Remotion. Build, preview, and export
          your videos with an intuitive timeline-based editor.
        </p>

        {/* CTA Button */}
        <div className="transform transition-all duration-200 hover:scale-105">
          <Link href="/studio/editor" className="">
            <Button>
              <span className="flex items-center gap-2 px-4">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="inline-block"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 0 0 4 4.11V15.89a1.5 1.5 0 0 0 2.3 1.269l9.344-5.89a1.5 1.5 0 0 0 0-2.538L6.3 2.84Z" />
                </svg>
                Launch Editor
              </span>
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-blue-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-blue-400"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Timeline Editor</h3>
            <p className="text-gray-400 text-sm">
              Intuitive timeline-based editing with precise control over every frame
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-orange-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-orange-400"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Live Preview</h3>
            <p className="text-gray-400 text-sm">
              See your changes in real-time with instant preview and playback
            </p>
          </div>

          <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 border border-gray-700/50 hover:border-red-400/50 transition-all duration-300 hover:transform hover:scale-105">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center mb-4">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-red-400"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Export & Render</h3>
            <p className="text-gray-400 text-sm">
              Export high-quality videos with professional rendering capabilities
            </p>
          </div>
        </div>
      </div>

      {/* Background Decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
}