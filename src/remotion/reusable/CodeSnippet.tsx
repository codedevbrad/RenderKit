import React, { useMemo } from "react";
import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

export interface CodeSnippetProps {
  code: string;
  language?: string;
  filename?: string;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  fadeInDelay?: number;
  fadeOutDelay?: number;
}

export const CodeSnippet: React.FC<CodeSnippetProps> = ({
  code,
  language = "javascript",
  filename,
  fadeInDuration = 30,
  fadeOutDuration = 30,
  fadeInDelay = 0,
  fadeOutDelay = 0,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();

  // Calculate opacity
  const opacity = useMemo(() => {
    if (frame < fadeInDelay) {
      return 0;
    }
    if (frame < fadeInDelay + fadeInDuration) {
      return interpolate(
        frame,
        [fadeInDelay, fadeInDelay + fadeInDuration],
        [0, 1],
        {
          extrapolateRight: "clamp",
          extrapolateLeft: "clamp",
        }
      );
    }

    const fadeOutProgress = spring({
      fps,
      frame: Math.max(0, frame - fadeInDelay - fadeInDuration),
      config: {
        damping: 200,
      },
      durationInFrames: fadeOutDuration,
      delay: fadeOutDelay,
    });

    if (fadeOutDuration > 0 && fadeOutDelay >= 0) {
      return 1 - fadeOutProgress;
    }

    return 1;
  }, [frame, fadeInDuration, fadeInDelay, fadeOutDuration, fadeOutDelay, fps]);

  // Map language to Prism language identifier
  const prismLanguage = useMemo(() => {
    const langMap: Record<string, string> = {
      javascript: "javascript",
      js: "javascript",
      typescript: "typescript",
      ts: "typescript",
      jsx: "jsx",
      tsx: "tsx",
      python: "python",
      py: "python",
      java: "java",
      cpp: "cpp",
      c: "c",
      csharp: "csharp",
      cs: "csharp",
      php: "php",
      ruby: "ruby",
      go: "go",
      rust: "rust",
      html: "markup",
      css: "css",
      json: "json",
      xml: "markup",
      sql: "sql",
      bash: "bash",
      shell: "bash",
      sh: "bash",
    };
    return langMap[language.toLowerCase()] || "javascript";
  }, [language]);

  // Generate default filename if not provided
  const displayFilename = useMemo(() => {
    if (filename) return filename;
    const extMap: Record<string, string> = {
      javascript: "index.js",
      js: "index.js",
      typescript: "index.ts",
      ts: "index.ts",
      jsx: "App.jsx",
      tsx: "App.tsx",
      python: "main.py",
      py: "main.py",
      java: "Main.java",
      cpp: "main.cpp",
      c: "main.c",
      csharp: "Program.cs",
      cs: "Program.cs",
      php: "index.php",
      ruby: "main.rb",
      go: "main.go",
      rust: "main.rs",
      html: "index.html",
      css: "style.css",
      json: "data.json",
      sql: "query.sql",
      bash: "script.sh",
      shell: "script.sh",
      sh: "script.sh",
    };
    return extMap[language.toLowerCase()] || "file.js";
  }, [filename, language]);

  return (
    <AbsoluteFill>
      <AbsoluteFill className="justify-center items-center p-8">
        <div
          style={{
            opacity,
            backgroundColor: "#160C28",
            borderRadius: "12px",
            maxWidth: "90%",
            maxHeight: "90%",
            overflow: "hidden",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header Bar */}
          <div
            style={{
              backgroundColor: "#000022",
              padding: "12px 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}
          >
    

            {/* Filename */}
            <div
              style={{
                flex: 1,
                textAlign: "center",
                color: "#cccccc",
                fontSize: "14px",
                fontFamily: "system-ui, -apple-system, sans-serif",
                fontWeight: "500",
                marginLeft: "16px",
              }}
            >
              {displayFilename}
            </div>
            
            {/* Window Controls */}
            <div
              style={{
                display: "flex",
                gap: "8px",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                  cursor: "pointer",
                }}
                title="Close"
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#ffbd2e",
                  cursor: "pointer",
                }}
                title="Minimize"
              />
              <div
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: "#28ca42",
                  cursor: "pointer",
                }}
                title="Fullscreen"
              />
            </div>
            {/* Spacer for alignment */}
            <div style={{ width: "44px" }} />
          </div>

          {/* Code Content */}
          <div
            style={{
              flex: 1,
              overflow: "auto",
              padding: "24px",
              fontSize: "24px",
              lineHeight: "1.6",
            }}
          >
            <SyntaxHighlighter
              language={prismLanguage}
              style={vscDarkPlus}
              customStyle={{
                margin: 0,
                padding: 0,
                background: "transparent",
                fontSize: "inherit",
                fontFamily: "monospace",
              }}
              codeTagProps={{
                style: {
                  fontFamily: "monospace",
                }
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

