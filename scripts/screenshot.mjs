// Capture portfolio screenshots from the running dev server.
// Usage: pnpm dev (port 3005) を起動した状態で `node scripts/screenshot.mjs`
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.BASE_URL ?? "http://localhost:3005";
const OUT = path.join(process.cwd(), "docs", "screenshots");

async function shoot(page, url, file, { fullPage = true } = {}) {
  await page.goto(url, { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(OUT, file), fullPage });
  console.log("✓", file);
}

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
});

await mkdir(OUT, { recursive: true });

// 1) Landing
await shoot(page, `${BASE}/`, "landing.png");

// 2) Browse / search
await shoot(page, `${BASE}/circles`, "browse.png");

// 3) Circle detail (テニス同好会 か、無ければ先頭のサークル)
await page.goto(`${BASE}/circles`, { waitUntil: "networkidle" });
const href = await page.evaluate(() => {
  const links = [...document.querySelectorAll('a[href^="/circles/c"]')];
  const tennis = links.find((a) => a.textContent?.includes("テニス同好会"));
  return (tennis ?? links[0])?.getAttribute("href") ?? null;
});
if (href) {
  await shoot(page, `${BASE}${href}`, "detail.png");
}

await browser.close();
console.log("done →", OUT);
