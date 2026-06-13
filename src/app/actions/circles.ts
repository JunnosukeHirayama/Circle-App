"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CircleAudience } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOrganizer } from "@/lib/session";
import {
  CATEGORIES,
  COVER_COLOR_KEYS,
  AUDIENCE_VALUES,
  AREA_OPTIONS,
} from "@/lib/constants";

const circleSchema = z.object({
  name: z.string().trim().min(2, "サークル名は2文字以上で入力してください").max(60),
  description: z.string().trim().min(10, "活動内容は10文字以上で入力してください").max(2000),
  rules: z.string().trim().max(2000).optional().or(z.literal("")),
  category: z.enum(CATEGORIES as unknown as [string, ...string[]]),
  audience: z.enum(AUDIENCE_VALUES as unknown as [string, ...string[]]),
  frequency: z.string().trim().min(1, "活動頻度を入力してください").max(60),
  area: z
    .string()
    .refine((v) => AREA_OPTIONS.includes(v), { message: "活動場所を選択してください" }),
  location: z.string().trim().max(60).optional().or(z.literal("")),
  capacity: z.preprocess(
    (v) => (v === "" || v == null ? undefined : v),
    z.coerce.number().int().min(1).max(100000).optional(),
  ),
  hasFee: z.enum(["yes", "no"], { message: "会費の有無を選択してください" }),
  feeText: z.string().trim().max(100).optional(),
  coverColor: z.enum(COVER_COLOR_KEYS as unknown as [string, ...string[]]),
  tags: z.string().optional(),
  images: z.string().optional(),
  recruiting: z.enum(["open", "paused"]).optional(),
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

function parseFee(
  hasFeeRaw: "yes" | "no",
  feeText?: string,
): { hasFee: boolean; feeText: string | null } | { error: string } {
  if (hasFeeRaw !== "yes") return { hasFee: false, feeText: null };
  const t = feeText?.trim();
  if (!t) return { error: "会費の内容（例：月額500円）を入力してください" };
  return { hasFee: true, feeText: t };
}

export async function createCircle(
  _prev: CircleFormState,
  formData: FormData,
): Promise<CircleFormState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isOrganizer(user)) return { error: "サークルを作成できるのは募集者用アカウントのみです" };

  // 1募集者アカウント = 1サークル
  const existingOwn = await prisma.circle.findFirst({ where: { ownerId: user.id } });
  if (existingOwn) {
    return { error: "1つのアカウントで作成できるサークルは1つまでです" };
  }

  const parsed = circleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const d = parsed.data;

  const fee = parseFee(d.hasFee, d.feeText);
  if ("error" in fee) return { error: fee.error };

  const circle = await prisma.circle.create({
    data: {
      name: d.name,
      description: d.description,
      rules: d.rules || null,
      category: d.category,
      audience: d.audience as CircleAudience,
      frequency: d.frequency,
      area: d.area,
      location: d.location || null,
      capacity: d.capacity ?? null,
      recruiting: d.recruiting !== "paused",
      hasFee: fee.hasFee,
      feeText: fee.feeText,
      coverColor: d.coverColor,
      tags: parseTags(d.tags),
      images: parseImages(d.images),
      ownerId: user.id,
    },
  });

  // 募集者のアカウント名＝サークル名 に同期
  await prisma.user.update({ where: { id: user.id }, data: { name: d.name } });

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  redirect(`/circles/${circle.id}`);
}

/**
 * 募集者アカウントの新規登録直後に、サークルを作成する。
 * createCircle と違いリダイレクトせず結果を返す（クライアントが遷移先を制御）。
 */
export async function registerCircle(
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };
  if (!isOrganizer(user)) return { error: "募集者用アカウントが必要です" };

  const existingOwn = await prisma.circle.findFirst({ where: { ownerId: user.id } });
  if (existingOwn) return { ok: true }; // すでに作成済みなら何もしない

  const parsed = circleSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const d = parsed.data;

  const fee = parseFee(d.hasFee, d.feeText);
  if ("error" in fee) return { error: fee.error };

  await prisma.circle.create({
    data: {
      name: d.name,
      description: d.description,
      rules: d.rules || null,
      category: d.category,
      audience: d.audience as CircleAudience,
      frequency: d.frequency,
      area: d.area,
      location: d.location || null,
      capacity: d.capacity ?? null,
      recruiting: d.recruiting !== "paused",
      hasFee: fee.hasFee,
      feeText: fee.feeText,
      coverColor: d.coverColor,
      tags: parseTags(d.tags),
      images: parseImages(d.images),
      ownerId: user.id,
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { name: d.name } });

  revalidatePath("/circles");
  revalidatePath("/dashboard");
  return { ok: true };
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

  const fee = parseFee(d.hasFee, d.feeText);
  if ("error" in fee) return { error: fee.error };

  await prisma.circle.update({
    where: { id: circleId },
    data: {
      name: d.name,
      description: d.description,
      rules: d.rules || null,
      category: d.category,
      audience: d.audience as CircleAudience,
      frequency: d.frequency,
      area: d.area,
      location: d.location || null,
      capacity: d.capacity ?? null,
      hasFee: fee.hasFee,
      feeText: fee.feeText,
      coverColor: d.coverColor,
      tags: parseTags(d.tags),
      images: parseImages(d.images),
    },
  });

  // 募集者のアカウント名＝サークル名 に同期
  await prisma.user.update({ where: { id: user.id }, data: { name: d.name } });

  revalidatePath(`/circles/${circleId}`);
  revalidatePath("/dashboard");
  redirect(`/circles/${circleId}`);
}

export async function setRecruiting(circleId: string, recruiting: boolean) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const existing = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!existing || existing.ownerId !== user.id) {
    throw new Error("操作権限がありません");
  }

  await prisma.circle.update({ where: { id: circleId }, data: { recruiting } });
  revalidatePath("/dashboard");
  revalidatePath(`/circles/${circleId}`);
  revalidatePath("/circles");
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
