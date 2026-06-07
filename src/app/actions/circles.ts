"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CircleAudience } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { CATEGORIES, COVER_COLOR_KEYS, AUDIENCE_VALUES } from "@/lib/constants";

const circleSchema = z.object({
  name: z.string().trim().min(2, "サークル名は2文字以上で入力してください").max(60),
  description: z.string().trim().min(10, "活動内容は10文字以上で入力してください").max(2000),
  rules: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  audience: z.enum(AUDIENCE_VALUES as unknown as [string, ...string[]]),
  location: z.string().trim().max(60).optional().or(z.literal("")),
  capacity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1).max(100000).optional(),
  ),
  coverColor: z.enum(COVER_COLOR_KEYS as unknown as [string, ...string[]]),
  tags: z.string().optional(),
  images: z.string().optional(),
});

export type CircleFormState = { error?: string };

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(/[,、\s]+/)
    .map((t) => t.replace(/^#/, "").trim())
    .filter(Boolean)
    .slice(0, 8);
}

// Only accept our own upload paths, capped at 5, to avoid arbitrary URLs.
function parseImages(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((u) => u.trim())
    .filter((u) => u.startsWith("/uploads/circles/"))
    .slice(0, 5);
}

export async function createCircle(
  _prev: CircleFormState,
  formData: FormData,
): Promise<CircleFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = circleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const d = parsed.data;

  const circle = await prisma.circle.create({
    data: {
      name: d.name,
      description: d.description,
      rules: d.rules || null,
      category: d.category,
      audience: d.audience as CircleAudience,
      location: d.location || null,
      capacity: d.capacity ?? null,
      coverColor: d.coverColor,
      tags: parseTags(d.tags),
      images: parseImages(d.images),
      ownerId: user.id,
    },
  });

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  redirect(`/circles/${circle.id}`);
}

export async function updateCircle(
  circleId: string,
  _prev: CircleFormState,
  formData: FormData,
): Promise<CircleFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!existing || existing.ownerId !== user.id) {
    return { error: "編集権限がありません" };
  }

  const parsed = circleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const d = parsed.data;

  await prisma.circle.update({
    where: { id: circleId },
    data: {
      name: d.name,
      description: d.description,
      rules: d.rules || null,
      category: d.category,
      audience: d.audience as CircleAudience,
      location: d.location || null,
      capacity: d.capacity ?? null,
      coverColor: d.coverColor,
      tags: parseTags(d.tags),
      images: parseImages(d.images),
    },
  });

  revalidatePath(`/circles/${circleId}`);
  revalidatePath("/dashboard");
  redirect(`/circles/${circleId}`);
}

export async function deleteCircle(circleId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!existing || existing.ownerId !== user.id) {
    throw new Error("削除権限がありません");
  }

  await prisma.circle.delete({ where: { id: circleId } });
  revalidatePath("/dashboard");
  revalidatePath("/circles");
  redirect("/dashboard");
}
