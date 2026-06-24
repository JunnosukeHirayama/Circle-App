import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // ログインが必要・非公開の領域はクロール対象外
      disallow: ["/dashboard", "/chat", "/me", "/api/"],
    },
    sitemap: `${BASE}/sitemap.xml`,
  };
}
