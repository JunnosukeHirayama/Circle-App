import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/circles", "/login", "/signup", "/terms", "/privacy", "/contact"];
  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((p) => ({
    url: `${BASE}${p}`,
  }));

  // 公開サークルの詳細ページ（DBに繋がらない環境では静的分のみ返す）
  let circleEntries: MetadataRoute.Sitemap = [];
  try {
    const circles = await prisma.circle.findMany({ select: { id: true, updatedAt: true } });
    circleEntries = circles.map((c) => ({
      url: `${BASE}/circles/${c.id}`,
      lastModified: c.updatedAt,
    }));
  } catch {
    // ignore — DB 未接続時は静的URLのみ
  }

  return [...staticEntries, ...circleEntries];
}
