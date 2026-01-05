import { z } from "zod";
import { AbsoluteFill } from "remotion";
import { CompositionProps } from "../../types/constants";
import { loadFont } from "@remotion/google-fonts/Inter";
import { TextItem, CodeItem } from "./reusable/SequenceItem";
import { AudioItem } from "./reusable/AudioItem";
import { GifItem } from "./reusable/GifItem";
import { useTiming } from "./helpers/timing";

loadFont("normal", {
  subsets: ["latin"],
  weights: ["400", "700"],
});

export const Main = (props: z.infer<typeof CompositionProps>) => {
  const { secondsToFrames } = useTiming();
  const { segments, layers = [] } = props;

  // Sort layers by order (lower order renders first, higher order on top)
  const sortedLayers = [...layers].sort((a, b) => a.order - b.order);

  // Group segments by layer
  const segmentsByLayer = sortedLayers.map(layer => ({
    layer,
    segments: segments.filter(seg => seg.layerId === layer.id),
  }));

  return (
    <AbsoluteFill className="bg-black">
      {segmentsByLayer.map(({ layer, segments: layerSegments }) => {
        return layerSegments.map((segment, index) => {
          const from = secondsToFrames(segment.start);
          const duration = secondsToFrames(segment.duration);
          const fadeInDuration = secondsToFrames(segment.fadeIn);
          const fadeOutDuration = secondsToFrames(segment.fadeOut);

          if (segment.type === "text") {
            return (
              <TextItem
                key={`${layer.id}-${index}`}
                from={from}
                duration={duration}
                text={segment.text}
                fadeInDuration={fadeInDuration}
                fadeOutDuration={fadeOutDuration}
              />
            );
          } else if (segment.type === "code") {
            return (
              <CodeItem
                key={`${layer.id}-${index}`}
                from={from}
                duration={duration}
                code={segment.code}
                language={segment.language}
                fadeInDuration={fadeInDuration}
                fadeOutDuration={fadeOutDuration}
              />
            );
          } else if (segment.type === "audio") {
            return (
              <AudioItem
                key={`${layer.id}-${index}`}
                from={from}
                duration={duration}
                audioUrl={segment.audioUrl}
                volume={segment.volume}
                fadeInDuration={fadeInDuration}
                fadeOutDuration={fadeOutDuration}
              />
            );
          } else if (segment.type === "gif") {
            return (
              <GifItem
                key={`${layer.id}-${index}`}
                from={from}
                duration={duration}
                gifUrl={segment.gifUrl}
                fadeInDuration={fadeInDuration}
                fadeOutDuration={fadeOutDuration}
              />
            );
          }
          return null;
        });
      })}
    </AbsoluteFill>
  );
};
