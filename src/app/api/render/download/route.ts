import { NextResponse } from "next/server";
import { stat, unlink } from "fs/promises";
import { createReadStream } from "fs";
import path from "path";
import { tmpdir } from "os";
import { fileCache } from "../cache";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const fileId = searchParams.get("fileId");

  if (!fileId) {
    return new NextResponse("File ID required", { status: 400 });
  }

  // Try to find file in cache or reconstruct path
  let filePath = fileCache.get(fileId);
  if (!filePath) {
    // Fallback: try to reconstruct path
    filePath = path.join(tmpdir(), `${fileId}.mp4`);
  }

  try {
    const stats = await stat(filePath);
    const fileStream = createReadStream(filePath);

    // Convert stream to buffer for Next.js response
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Clean up file and cache entry
    fileCache.delete(fileId);
    await unlink(filePath).catch(() => {
      // Ignore cleanup errors
    });

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="video.mp4"`,
        "Content-Length": stats.size.toString(),
      },
    });
  } catch (error) {
    fileCache.delete(fileId);
    return new NextResponse("File not found or expired", { status: 404 });
  }
}

