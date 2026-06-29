// サークルの「安心スコア」を算出する。
// 透明性を保つため、根拠が説明できるシンプルな加点・減点方式にしている。

export type TrustInput = {
  ownerVerified: boolean; // 運営者が本人確認済みか
  avgRating: number | null; // 口コミ平均（1..5）。無ければ null
  reviewCount: number;
  reportCount: number; // このサークルへの通報数
  hasRules: boolean; // ルールを掲載しているか
};

export function trustScore(i: TrustInput): number {
  let score = 50;
  if (i.ownerVerified) score += 20;
  if (i.hasRules) score += 5;
  if (i.reviewCount > 0 && i.avgRating != null) {
    score += Math.round((i.avgRating - 3) * 10); // 5★→+20, 3★→0, 1★→-20
    score += Math.min(i.reviewCount * 2, 10); // 件数ボーナス（最大+10）
  }
  score -= Math.min(i.reportCount * 5, 25); // 通報ペナルティ（最大-25）
  return Math.max(0, Math.min(100, score));
}

export function trustLabel(score: number): { label: string; style: string } {
  if (score >= 80) return { label: "とても安心", style: "bg-emerald-100 text-emerald-700" };
  if (score >= 60) return { label: "安心", style: "bg-emerald-100 text-emerald-600" };
  if (score >= 40) return { label: "標準", style: "bg-amber-100 text-amber-700" };
  return { label: "注意", style: "bg-rose-100 text-rose-600" };
}
