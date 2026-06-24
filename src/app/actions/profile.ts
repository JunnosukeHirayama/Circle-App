"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

const profileSchema = z.object({
  name: z.string().trim().min(1, "お名前を入力してください").max(40),
  bio: z.string().trim().max(500).optional().or(z.literal("")),
  affiliation: z.string().trim().max(80).optional().or(z.literal("")),
  location: z.string().trim().max(60).optional().or(z.literal("")),
  emailNotifications: z.enum(["on", "off"]).optional(),
});

export type ProfileState = { error?: string; ok?: boolean };

export async function updateProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const d = parsed.data;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      bio: d.bio || null,
      affiliation: d.affiliation || null,
      location: d.location || null,
      emailNotifications: d.emailNotifications !== "off",
    },
  });

  revalidatePath("/me");
  return { ok: true };
}

/** 通知設定（新着メッセージのメール通知）のみを更新する。 */
export async function updateNotificationSettings(
  enabled: boolean,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };
  await prisma.user.update({
    where: { id: user.id },
    data: { emailNotifications: enabled },
  });
  revalidatePath("/me");
  return { ok: true };
}

/** アカウント削除。関連データ（サークル・応募・チャット等）も連鎖削除されます。 */
export async function deleteAccount(): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };

  // onDelete: Cascade により、所有サークル・応募・チャット・通報なども削除される
  await prisma.user.delete({ where: { id: user.id } });
  return { ok: true };
}
