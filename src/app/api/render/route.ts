import { RenderRequest } from "../../../../types/schema";
import { executeApi } from "../../../helpers/api-response";
import { VIDEO_FPS, VIDEO_HEIGHT, VIDEO_WIDTH } from "../../../../types/constants";
import path from "path";
import { tmpdir } from "os";
import { unlink, stat } from "fs/promises";
import { fileCache } from "./cache";

// Mark as server-only route
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const POST = executeApi<
  { url: string; size: number },
  typeof RenderRequest
>(RenderRequest, async (req, body) => {
  // Dynamic imports to avoid build-time analysis
  const { bundle } = await import("@remotion/bundler");
  const { renderMedia } = await import("@remotion/renderer");
  const { webpackOverride } = await import("../../../remotion/webpack-override.mjs");
  const fileId = `remotion-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const outputPath = path.join(tmpdir(), `${fileId}.mp4`);
  let bundleLocation: string | null = null;

  try {
    // Bundle the Remotion project
    bundleLocation = await bundle({
      entryPoint: path.resolve(process.cwd(), "src/remotion/index.ts"),
      webpackOverride,
      publicDir: path.resolve(process.cwd(), "public"),
    });

    // Calculate duration from segments
    const maxEnd = Math.max(
      ...body.inputProps.segments.map((seg) => seg.start + seg.duration),
      1 // Minimum 1 second
    );
    const durationInFrames = Math.ceil(maxEnd * VIDEO_FPS);

    // Render the video
    await renderMedia({
      composition: {
        id: body.id,
        width: VIDEO_WIDTH,
        height: VIDEO_HEIGHT,
        fps: VIDEO_FPS,
        durationInFrames,
      },
      serveUrl: bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: body.inputProps,
    });

    // Get file size
    const stats = await stat(outputPath);
    const fileSize = stats.size;

    // Clean up bundle
    if (bundleLocation) {
      await unlink(bundleLocation).catch(() => {
        // Ignore cleanup errors
      });
    }

    // Store file path in cache for download endpoint
    fileCache.set(fileId, outputPath);

    // Schedule cleanup after 10 minutes
    setTimeout(() => {
      fileCache.delete(fileId);
      unlink(outputPath).catch(() => {
        // Ignore cleanup errors
      });
    }, 10 * 60 * 1000);

    // Return download URL
    return {
      url: `/api/render/download?fileId=${fileId}`,
      size: fileSize,
    };
  } catch (error) {
    // Clean up on error
    if (bundleLocation) {
      await unlink(bundleLocation).catch(() => {
        // Ignore cleanup errors
      });
    }
    await unlink(outputPath).catch(() => {
      // Ignore cleanup errors
    });
    fileCache.delete(fileId);
    throw error;
  }
});

