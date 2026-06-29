import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** 本人確認済みを示すバッジ。verificationStatus が "VERIFIED" のときだけ表示。 */
export function VerifiedBadge({
  status,
  size = "sm",
  withLabel = true,
  className,
}: {
  status?: string | null;
  size?: "sm" | "md";
  withLabel?: boolean;
  className?: string;
}) {
  if (status !== "VERIFIED") return null;
  const icon = size === "md" ? "h-4 w-4" : "h-3.5 w-3.5";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-sky-100 px-2 py-0.5 font-bold text-sky-700",
        size === "md" ? "text-xs" : "text-[10px]",
        className,
      )}
      title="本人確認済み"
    >
      <BadgeCheck className={icon} />
      {withLabel && "本人確認済み"}
    </span>
  );
}
