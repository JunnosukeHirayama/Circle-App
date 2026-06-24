import type { ReactNode } from "react";

/** 規約・ポリシー系ページ共通のレイアウト（読みやすい本文スタイル）。 */
export function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-stone-800">{title}</h1>
      {updated && <p className="mt-2 text-sm text-stone-400">最終更新日：{updated}</p>}
      <div className="legal mt-8 space-y-6 text-stone-600">{children}</div>
    </div>
  );
}

/** 1つの条項セクション。 */
export function Section({ heading, children }: { heading: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-extrabold text-stone-800">{heading}</h2>
      <div className="space-y-2 text-sm leading-relaxed">{children}</div>
    </section>
  );
}
