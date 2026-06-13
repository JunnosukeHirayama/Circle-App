"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { AREA_SPECIAL, PREFECTURES } from "@/lib/constants";

type Params = {
  q?: string;
  audience?: string;
  category?: string;
  area?: string;
  fee?: string;
};

export function CircleFilters({ current }: { current: Params }) {
  const router = useRouter();

  function navigate(patch: Partial<Params>) {
    const merged = { ...current, ...patch };
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(merged)) {
      if (v) qs.set(k, v);
    }
    const s = qs.toString();
    router.push(s ? `/circles?${s}` : "/circles");
  }

  function onSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = new FormData(e.currentTarget).get("q");
    navigate({ q: typeof q === "string" ? q : "" });
  }

  const selectCls =
    "h-11 rounded-2xl border border-stone-200 bg-white px-3 text-sm text-stone-700 focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200";

  return (
    <div className="mt-4 space-y-3">
      {/* keyword */}
      <form onSubmit={onSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
          <input
            name="q"
            defaultValue={current.q ?? ""}
            placeholder="キーワードで検索（例：フットサル、英語）"
            className="h-12 w-full rounded-full border border-stone-200 bg-white pl-12 pr-4 text-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
        </div>
        <button className="h-12 rounded-full bg-amber-400 px-6 text-sm font-semibold text-amber-950 transition hover:bg-amber-300">
          検索
        </button>
      </form>

      {/* area + fee */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5 text-sm text-stone-500">
          <span className="font-semibold">活動場所</span>
          <select
            value={current.area ?? ""}
            onChange={(e) => navigate({ area: e.target.value })}
            className={selectCls}
          >
            <option value="">すべて</option>
            <optgroup label="エリア区分">
              {AREA_SPECIAL.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </optgroup>
            <optgroup label="都道府県">
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </optgroup>
          </select>
        </label>

        <label className="flex items-center gap-1.5 text-sm text-stone-500">
          <span className="font-semibold">会費</span>
          <select
            value={current.fee ?? ""}
            onChange={(e) => navigate({ fee: e.target.value })}
            className={selectCls}
          >
            <option value="">すべて</option>
            <option value="free">会費なし</option>
            <option value="paid">会費あり</option>
          </select>
        </label>
      </div>
    </div>
  );
}
