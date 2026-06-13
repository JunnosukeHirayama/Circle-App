import Link from "next/link";
import { SlidersHorizontal, Users } from "lucide-react";
import type { Prisma, CircleAudience } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getBlockerIdsOf } from "@/lib/blocks";
import { CircleCard } from "@/components/CircleCard";
import { CircleFilters } from "@/components/CircleFilters";
import { CATEGORIES, AUDIENCE_FILTERS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchArgs = {
  category?: string;
  q?: string;
  audience?: string;
  area?: string;
  fee?: string;
};

/** Build a /circles URL keeping the other active filters. */
function hrefWith(current: SearchArgs, patch: Partial<SearchArgs>) {
  const merged = { ...current, ...patch };
  const qs = new URLSearchParams();
  for (const k of ["category", "q", "audience", "area", "fee"] as const) {
    if (merged[k]) qs.set(k, merged[k] as string);
  }
  const s = qs.toString();
  return s ? `/circles?${s}` : "/circles";
}

export default async function CirclesPage({
  searchParams,
}: {
  searchParams: Promise<SearchArgs>;
}) {
  const params = await searchParams;
  const { category, q, audience, area, fee } = params;

  const where: Prisma.CircleWhereInput = {};
  if (category && CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
    where.category = category;
  }
  const audienceFilter = AUDIENCE_FILTERS.find((a) => a.key === audience);
  if (audienceFilter) {
    where.audience = { in: audienceFilter.match as unknown as CircleAudience[] };
  }
  if (area) where.area = area;
  if (fee === "free") where.hasFee = false;
  if (fee === "paid") where.hasFee = true;
  if (q && q.trim()) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
      { tags: { has: q } },
    ];
  }

  // ブロックされている募集者のサークルは表示しない
  const user = await getCurrentUser();
  if (user) {
    const blockerIds = await getBlockerIdsOf(user.id);
    if (blockerIds.length > 0) where.ownerId = { notIn: blockerIds };
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
        <div className="grid grid-cols-2 gap-2 sm:max-w-xl sm:grid-cols-4">
          <Link
            href={hrefWith(params, { audience: undefined })}
            className={cn(
              "flex items-center justify-center rounded-2xl px-2 py-3 text-center text-sm font-bold transition",
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

      {/* keyword + 活動場所 + 会費 */}
      <CircleFilters current={params} />

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
