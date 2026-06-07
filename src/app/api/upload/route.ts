import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";

export const runtime = "nodejs";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB / 枚
const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "circles");

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "ログインが必要です" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "画像が選択されていません" }, { status: 400 });
  }
  if (files.length > MAX_FILES) {
    return NextResponse.json({ error: "画像は最大5枚までです" }, { status: 400 });
  }

  await mkdir(UPLOAD_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = ALLOWED[file.type];
    if (!ext) {
      return NextResponse.json(
        { error: "対応していない画像形式です（JPEG / PNG / WebP / GIF）" },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "1枚あたり5MBまでにしてください" },
        { status: 400 },
      );
    }
    const name = `${randomUUID()}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(UPLOAD_DIR, name), buffer);
    urls.push(`/uploads/circles/${name}`);
  }

  return NextResponse.json({ urls });
}
