import { NextRequest } from "next/server";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { UPLOAD_DIR, CONTENT_TYPE_BY_EXT } from "@/lib/uploads";

export const runtime = "nodejs";

// アップロード画像を配信する: GET /api/uploads/circles/<file>
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;

  // パストラバーサル対策
  if (segments.some((s) => s.includes("..") || s.includes("/") || s.includes("\\"))) {
    return new Response("Bad request", { status: 400 });
  }

  const filePath = path.join(UPLOAD_DIR, ...segments);
  const resolved = path.resolve(filePath);
  if (!resolved.startsWith(path.resolve(UPLOAD_DIR))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const info = await stat(resolved);
    if (!info.isFile()) return new Response("Not found", { status: 404 });
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const ext = path.extname(resolved).slice(1).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream";
  const data = await readFile(resolved);

  return new Response(new Uint8Array(data), {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
