"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { sendEmail } from "@/lib/email";
import { REPORT_REASONS } from "@/lib/constants";

const schema = z.object({
  targetType: z.enum(["CIRCLE", "USER"]),
  targetId: z.string().min(1),
  reason: z.enum(REPORT_REASONS),
  detail: z.string().trim().max(1000).optional(),
});

const OPERATOR_EMAIL = process.env.REPORT_TO_EMAIL ?? "support@example.com";

export async function submitReport(input: {
  targetType: "CIRCLE" | "USER";
  targetId: string;
  reason: string;
  detail?: string;
}): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };

  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "通報内容を確認してください" };
  const d = parsed.data;

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType: d.targetType,
      targetId: d.targetId,
      reason: d.reason,
      detail: d.detail || null,
    },
  });

  // 運営へ通知（メール未設定時はログ出力）
  const label = d.targetType === "CIRCLE" ? "サークル" : "ユーザー";
  void sendEmail({
    to: OPERATOR_EMAIL,
    subject: `【通報】${label}が通報されました（${d.reason}）`,
    text: `通報者: ${user.name} (${user.email})\n対象: ${label} / ${d.targetId}\n理由: ${d.reason}\n詳細: ${d.detail || "（なし）"}`,
  });

  return { ok: true };
}
