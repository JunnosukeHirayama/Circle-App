import { NextRequest } from "next/server";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { VERIFY_DIR, CONTENT_TYPE_BY_EXT } from "@/lib/uploads";

export const runtime = "nodejs";

// 本人確認書類は運営（管理者）のみ閲覧可能。
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ name: string }> },
) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user)) return new Response("Forbidden", { status: 403 });

  const { name } = await params;
  if (name.includes("..") || name.includes("/") || name.includes("\\")) {
    return new Response("Bad request", { status: 400 });
  }

  const resolved = path.resolve(path.join(VERIFY_DIR, name));
  if (!resolved.startsWith(path.resolve(VERIFY_DIR))) {
    return new Response("Forbidden", { status: 403 });
  }

  try {
    const data = await readFile(resolved);
    const ext = path.extname(resolved).slice(1).toLowerCase();
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": CONTENT_TYPE_BY_EXT[ext] ?? "application/octet-stream",
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
