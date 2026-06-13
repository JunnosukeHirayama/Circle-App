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
