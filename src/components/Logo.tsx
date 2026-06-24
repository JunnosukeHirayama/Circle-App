import { cn } from "@/lib/utils";

/**
 * サークルリンクのブランドマーク。
 * 2つの輪が重なる＝「サークル（輪）」×「リンク（つながり）」を表す。
 */
export function BrandMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-2xl bg-amber-400 text-white shadow-sm shadow-amber-200",
        className,
      )}
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 28 24"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="10" cy="12" r="6.4" stroke="currentColor" strokeWidth="2.6" />
        <circle cx="18" cy="12" r="6.4" stroke="currentColor" strokeWidth="2.6" />
      </svg>
    </span>
  );
}

/** ロゴマーク＋ワードマーク（「サークルリンク」）。 */
export function Logo({ size = 36 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2 font-extrabold text-stone-800">
      <BrandMark size={size} />
      <span className="text-lg">
        サークル<span className="text-amber-500">リンク</span>
      </span>
    </span>
  );
}
