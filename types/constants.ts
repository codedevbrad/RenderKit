import { z } from "zod";
export const COMP_NAME = "MyComp";

export const SegmentSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("text"),
    start: z.number(),
    duration: z.number(),
    text: z.string(),
    fadeIn: z.number().default(0.5),
    fadeOut: z.number().default(0.5),
    layerId: z.string(),
  }),
  z.object({
    type: z.literal("code"),
    start: z.number(),
    duration: z.number(),
    code: z.string(),
    language: z.string(),
    fadeIn: z.number().default(0.5),
    fadeOut: z.number().default(0.5),
    layerId: z.string(),
  }),
  z.object({
    type: z.literal("audio"),
    start: z.number(),
    duration: z.number(),
    audioUrl: z.string(),
    name: z.string().optional(),
    volume: z.number().default(1),
    fadeIn: z.number().default(0.5),
    fadeOut: z.number().default(0.5),
    layerId: z.string(),
  }),
  z.object({
    type: z.literal("gif"),
    start: z.number(),
    duration: z.number(),
    gifUrl: z.string(),
    name: z.string().optional(),
    fadeIn: z.number().default(0.5),
    fadeOut: z.number().default(0.5),
    layerId: z.string(),
  }),
]);

export type Segment = z.infer<typeof SegmentSchema>;

export const LayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(["video", "audio"]),
  order: z.number(),
});

export type Layer = z.infer<typeof LayerSchema>;

export const CompositionProps = z.object({
  segments: z.array(SegmentSchema),
  layers: z.array(LayerSchema).optional(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  layers: [
    { id: "video-1", name: "Video Layer 1", type: "video", order: 0 },
    { id: "audio-1", name: "Audio Layer 1", type: "audio", order: 1 },
  ],
  segments: [],
};

// 60 seconds
export const DURATION_IN_FRAMES = 60 * 30;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;

const data = [
  {
    type: "text",
    start: 0,
    duration: 2.5,
    text: "React in 60 seconds.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },
  {
    type: "text",
    start: 2.7,
    duration: 3,
    text: "React is a JavaScript library for building user interfaces.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },
  {
    type: "text",
    start: 6,
    duration: 3,
    text: "Your UI is a function of state.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "code",
    start: 9.5,
    duration: 6,
    code: `function App() {
return <h1>Hello React</h1>;
}`,
    language: "javascript",
    fadeIn: 0.4,
    fadeOut: 0.4,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 16,
    duration: 3,
    text: "Components are just functions.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "code",
    start: 19.5,
    duration: 7,
    code: `function Button({ label }) {
return <button>{label}</button>;
}`,
    language: "javascript",
    fadeIn: 0.4,
    fadeOut: 0.4,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 27,
    duration: 3,
    text: "State makes things interactive.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "code",
    start: 30.5,
    duration: 8,
    code: `import { useState } from "react";

function Counter() {
const [count, setCount] = useState(0);

return (
  <button onClick={() => setCount(count + 1)}>
    {count}
  </button>
);
}`,
    language: "javascript",
    fadeIn: 0.4,
    fadeOut: 0.4,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 39.5,
    duration: 3,
    text: "When state changes… React re-renders.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 43,
    duration: 3,
    text: "You never touch the DOM directly.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "code",
    start: 46.5,
    duration: 7,
    code: `// ❌ Don't do this
document.querySelector("button");

// ✅ Let React handle it`,
    language: "javascript",
    fadeIn: 0.4,
    fadeOut: 0.4,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 54.5,
    duration: 3,
    text: "Hooks power everything.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },

  {
    type: "code",
    start: 58,
    duration: 6,
    code: `useState()
useEffect()
useMemo()
useCallback()`,
    language: "javascript",
    fadeIn: 0.4,
    fadeOut: 0.4,
    layerId: "video-1",
  },

  {
    type: "text",
    start: 65,
    duration: 3,
    text: "That's React. Declarative. Composable. Fast.",
    fadeIn: 0.3,
    fadeOut: 0.3,
    layerId: "video-1",
  },
]