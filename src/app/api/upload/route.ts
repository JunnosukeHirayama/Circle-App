import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { getCurrentUser } from "@/lib/session";
import { UPLOAD_DIR, UPLOAD_URL_PREFIX, ALLOWED_IMAGE_EXT } from "@/lib/uploads";

export const runtime = "nodejs";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5MB / 枚

const CIRCLES_DIR = path.join(UPLOAD_DIR, "circles");

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

  await mkdir(CIRCLES_DIR, { recursive: true });

  const urls: string[] = [];
  for (const file of files) {
    const ext = ALLOWED_IMAGE_EXT[file.type];
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
    await writeFile(path.join(CIRCLES_DIR, name), buffer);
    urls.push(`${UPLOAD_URL_PREFIX}/circles/${name}`);
  }

  return NextResponse.json({ urls });
}
