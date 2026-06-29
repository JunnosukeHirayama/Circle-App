"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const schema = z.object({
  circleId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(500).optional(),
});

export async function submitReview(input: {
  circleId: string;
  rating: number;
  comment?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };
  if (!(user as { emailVerified?: boolean }).emailVerified) {
    return { error: "口コミの投稿にはメールアドレスの確認が必要です" };
  }

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "評価を選択してください" };
  const d = parsed.data;

  const circle = await prisma.circle.findUnique({
    where: { id: d.circleId },
    select: { ownerId: true },
  });
  if (!circle) return { error: "サークルが見つかりません" };
  if (circle.ownerId === user.id) return { error: "自分のサークルには投稿できません" };

  await prisma.review.upsert({
    where: { circleId_reviewerId: { circleId: d.circleId, reviewerId: user.id } },
    create: { circleId: d.circleId, reviewerId: user.id, rating: d.rating, comment: d.comment || null },
    update: { rating: d.rating, comment: d.comment || null },
  });

  revalidatePath(`/circles/${d.circleId}`);
  return { ok: true };
}
