"use client";

import { useState } from "react";
import { Info, X, ShieldCheck } from "lucide-react";

const RULES: { label: string; value: string }[] = [
  { label: "基準点", value: "50点からスタート" },
  { label: "運営者が本人確認済み", value: "+20" },
  { label: "ルール・お約束を掲載", value: "+5" },
  { label: "口コミ評価", value: "3.0を基準に ±10/★（最大±20）" },
  { label: "口コミ件数", value: "+2/件（最大+10）" },
  { label: "通報", value: "−5/件（最大−25）" },
];

const LABELS = [
  { range: "80〜100", label: "とても安心", style: "bg-emerald-100 text-emerald-700" },
  { range: "60〜79", label: "安心", style: "bg-emerald-100 text-emerald-600" },
  { range: "40〜59", label: "標準", style: "bg-amber-100 text-amber-700" },
  { range: "0〜39", label: "注意", style: "bg-rose-100 text-rose-600" },
];

export function TrustScoreInfo() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="安心スコアの採点基準"
        className="inline-grid h-4 w-4 place-items-center rounded-full text-stone-400 transition hover:text-amber-500"
      >
        <Info className="h-4 w-4" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-md animate-float-in rounded-4xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                安心スコアの採点基準
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-sm text-stone-500">
              安心して参加できるサークルかどうかの目安です（100点満点）。本人確認・口コミ・通報などから自動で算出されます。
            </p>

            <dl className="mt-4 divide-y divide-stone-100">
              {RULES.map((r) => (
                <div key={r.label} className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-sm text-stone-600">{r.label}</dt>
                  <dd className="text-right text-sm font-bold text-stone-800">{r.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold text-stone-700">スコアの目安</p>
              <div className="flex flex-wrap gap-2">
                {LABELS.map((l) => (
                  <span key={l.label} className="inline-flex items-center gap-1.5 text-xs text-stone-500">
                    <span className={`rounded-full px-2 py-0.5 font-bold ${l.style}`}>{l.label}</span>
                    {l.range}
                  </span>
                ))}
              </div>
            </div>

            <p className="mt-4 text-xs text-stone-400">
              ※ スコアは活動の安全性を保証するものではありません。最終的な参加判断はご自身で行ってください。
            </p>
          </div>
        </div>
      )}
    </>
  );
}
