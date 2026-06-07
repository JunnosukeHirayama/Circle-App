// Shared domain constants & theme helpers.

export const CATEGORIES = [
  "スポーツ",
  "音楽",
  "アウトドア",
  "勉強・学習",
  "ゲーム",
  "アート・創作",
  "ボランティア",
  "ビジネス・交流",
  "グルメ",
  "その他",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Friendly pastel themes used for circle cover cards & avatars.
export const COVER_COLORS = {
  amber: { bg: "bg-amber-100", text: "text-amber-700", solid: "bg-amber-400", ring: "ring-amber-200" },
  rose: { bg: "bg-rose-100", text: "text-rose-700", solid: "bg-rose-400", ring: "ring-rose-200" },
  sky: { bg: "bg-sky-100", text: "text-sky-700", solid: "bg-sky-400", ring: "ring-sky-200" },
  emerald: { bg: "bg-emerald-100", text: "text-emerald-700", solid: "bg-emerald-400", ring: "ring-emerald-200" },
  violet: { bg: "bg-violet-100", text: "text-violet-700", solid: "bg-violet-400", ring: "ring-violet-200" },
  orange: { bg: "bg-orange-100", text: "text-orange-700", solid: "bg-orange-400", ring: "ring-orange-200" },
} as const;

export type CoverColor = keyof typeof COVER_COLORS;

export const COVER_COLOR_KEYS = Object.keys(COVER_COLORS) as CoverColor[];

export function coverTheme(color: string) {
  return COVER_COLORS[(color as CoverColor) in COVER_COLORS ? (color as CoverColor) : "amber"];
}

// --- 対象者（誰が参加できるか） ---
export const AUDIENCES = [
  { value: "STUDENT", label: "学生限定", icon: "🎓", style: "bg-sky-100 text-sky-700" },
  { value: "WORKING", label: "社会人限定", icon: "💼", style: "bg-violet-100 text-violet-700" },
  { value: "BOTH", label: "学生・社会人OK", icon: "🤝", style: "bg-emerald-100 text-emerald-700" },
] as const;

export type AudienceValue = (typeof AUDIENCES)[number]["value"];

export const AUDIENCE_VALUES = AUDIENCES.map((a) => a.value) as AudienceValue[];

export function audienceMeta(value: string) {
  return AUDIENCES.find((a) => a.value === value) ?? AUDIENCES[2];
}

// 検索画面トップの絞り込みチップ。"学生" を選ぶと学生が参加できる
// （学生限定＋両方可）サークルを表示する。
export const AUDIENCE_FILTERS = [
  { key: "student", label: "学生歓迎", icon: "🎓", match: ["STUDENT", "BOTH"] },
  { key: "working", label: "社会人歓迎", icon: "💼", match: ["WORKING", "BOTH"] },
] as const;

export type AudienceFilterKey = (typeof AUDIENCE_FILTERS)[number]["key"];

export const APPLICATION_STATUS_LABEL: Record<string, string> = {
  PENDING: "選考中",
  ACCEPTED: "参加OK",
  REJECTED: "見送り",
};

export const APPLICATION_STATUS_STYLE: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-gray-100 text-gray-500",
};
