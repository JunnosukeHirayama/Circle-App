export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

/** Japanese relative time formatter, e.g. "3分前". */
export function timeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "たった今";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}分前`;
  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}時間前`;
  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}日前`;
  return d.toLocaleDateString("ja-JP", { month: "long", day: "numeric" });
}

/** Short clock time, e.g. "14:05". */
export function clockTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
}

/** First grapheme of a name, for avatar fallbacks. */
export function initial(name?: string | null): string {
  if (!name) return "?";
  return [...name][0]?.toUpperCase() ?? "?";
}
