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

// --- 活動場所（必須・検索用） ---
export const AREA_SPECIAL = ["全国", "オンライン", "海外"] as const;

export const PREFECTURES = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県",
  "岐阜県", "静岡県", "愛知県", "三重県",
  "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

export const AREA_OPTIONS = [...AREA_SPECIAL, ...PREFECTURES] as readonly string[];

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
  { value: "STUDENT", label: "学生のみ", icon: "🎓", style: "bg-sky-100 text-sky-700" },
  { value: "WORKING", label: "社会人のみ", icon: "💼", style: "bg-violet-100 text-violet-700" },
  { value: "BOTH", label: "学生・社会人OK！", icon: "🤝", style: "bg-emerald-100 text-emerald-700" },
] as const;

export type AudienceValue = (typeof AUDIENCES)[number]["value"];

export const AUDIENCE_VALUES = AUDIENCES.map((a) => a.value) as AudienceValue[];

export function audienceMeta(value: string) {
  return AUDIENCES.find((a) => a.value === value) ?? AUDIENCES[2];
}

// 検索画面トップの絞り込みチップ（対象者の値に完全一致でしぼり込む）。
export const AUDIENCE_FILTERS = [
  { key: "student", label: "学生のみ", icon: "🎓", match: ["STUDENT"] },
  { key: "working", label: "社会人のみ", icon: "💼", match: ["WORKING"] },
  { key: "both", label: "学生・社会人OK！", icon: "🤝", match: ["BOTH"] },
] as const;

export type AudienceFilterKey = (typeof AUDIENCE_FILTERS)[number]["key"];

// --- アカウント種別 ---
export const ROLES = {
  APPLICANT: "APPLICANT",
  ORGANIZER: "ORGANIZER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABEL: Record<string, string> = {
  APPLICANT: "一般ユーザー",
  ORGANIZER: "サークル運営",
};

// 会費の表示ラベル（自由記述）
export function feeLabel(hasFee: boolean, feeText: string | null | undefined) {
  if (!hasFee) return "会費なし";
  return feeText && feeText.trim() ? feeText.trim() : "会費あり";
}

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
