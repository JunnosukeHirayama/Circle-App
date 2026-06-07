import Link from "next/link";
import { Search, SlidersHorizontal, Users } from "lucide-react";
import type { Prisma, CircleAudience } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { CircleCard } from "@/components/CircleCard";
import { CATEGORIES, AUDIENCE_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchArgs = { category?: string; q?: string; audience?: string };

/** Build a /circles URL keeping the other active filters. */
function hrefWith(current: SearchArgs, patch: Partial<SearchArgs>) {
  const merged = { ...current, ...patch };
  const qs = new URLSearchParams();
  if (merged.category) qs.set("category", merged.category);
  if (merged.q) qs.set("q", merged.q);
  if (merged.audience) qs.set("audience", merged.audience);
  const s = qs.toString();
  return s ? `/circles?${s}` : "/circles";
}

export default async function CirclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchArgs>;
}) {
  const params = await searchParams;
  const { category, q, audience } = params;

  const where: Prisma.CircleWhereInput = {};
  if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    where.category = category;
  }
  const audienceFilter = AUDIENCE_FILTERS.find((a) => a.key === audience);
  if (audienceFilter) {
    where.audience = { in: audienceFilter.match as unknown as CircleAudience[] };
  }
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  const circles = await prisma.circle.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-stone-800">サークルを探す</h1>
        <p className="text-stone-500">気になるサークルを見つけて、仲間になろう。</p>
      </div>

      {/* 対象者フィルター（最重要・最上部） */}
      <div className="mt-6 rounded-4xl border border-amber-100 bg-white p-4 shadow-sm sm:p-5">
        <p className="mb-3 flex items-center gap-1.5 text-sm font-bold text-stone-700">
          <Users className="h-4 w-4 text-amber-500" />
          対象者でしぼり込む
        </p>
        <div className="grid grid-cols-3 gap-2 sm:max-w-md">
          <Link
            href={hrefWith(params, { audience: undefined })}
            className={cn(
              "rounded-2xl px-2 py-3 text-center text-sm font-bold transition",
              !audienceFilter
                ? "bg-amber-400 text-amber-950 shadow-sm"
                : "bg-stone-50 text-stone-500 hover:bg-amber-50",
            )}
          >
            すべて
          </Link>
          {AUDIENCE_FILTERS.map((a) => (
            <Link
              key={a.key}
              href={hrefWith(params, { audience: a.key })}
              className={cn(
                "flex items-center justify-center gap-1 rounded-2xl px-2 py-3 text-center text-sm font-bold transition",
                audience === a.key
                  ? "bg-amber-400 text-amber-950 shadow-sm"
                  : "bg-stone-50 text-stone-500 hover:bg-amber-50",
              )}
            >
              <span>{a.icon}</span>
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Search */}
      <form className="mt-4 flex gap-2" action="/circles" method="get">
        {category && <input type="hidden" name="category" value={category} />}
        {audience && <input type="hidden" name="audience" value={audience} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="キーワードで検索（例：フットサル、英語）"
            className="h-12 w-full rounded-full border border-stone-200 bg-white pl-12 pr-4 text-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button className="h-12 rounded-full bg-amber-400 px-6 text-sm font-semibold text-amber-950 transition hover:bg-amber-300">
          検索
        </button>
      </form>

      {/* Category filters */}
      <div className="mt-4 flex items-center gap-2 overflow-x-auto pb-2">
        <SlidersHorizontal className="h-4 w-4 shrink-0 text-stone-400" />
        <Link
          href={hrefWith(params, { category: undefined })}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
            !category ? "bg-amber-400 text-amber-950" : "bg-white text-stone-600 hover:bg-amber-50",
          )}
        >
          すべて
        </Link>
        {CATEGORIES.map((c) => (
          <Link
            key={c}
            href={hrefWith(params, { category: c })}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              category === c
                ? "bg-amber-400 text-amber-950"
                : "bg-white text-stone-600 hover:bg-amber-50",
            )}
          >
            {c}
          </Link>
        ))}
      </div>

      {/* Results */}
      <p className="mt-6 text-sm text-stone-400">{circles.length}件のサークル</p>
      {circles.length === 0 ? (
        <div className="mt-10 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-16 text-center">
          <p className="text-lg font-semibold text-stone-600">該当するサークルがありませんでした</p>
          <p className="mt-1 text-sm text-stone-400">条件を変えて探してみましょう。</p>
          <Link
            href="/circles/new"
            className="mt-5 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-300"
          >
            自分でサークルを作る
          </Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {circles.map((c) => (
            <CircleCard key={c.id} circle={c} />
          ))}
        </div>
      )}
    </div>
  );
}
