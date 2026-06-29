"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { VERIFY_DIR, ALLOWED_IMAGE_EXT } from "@/lib/uploads";

const MAX_BYTES = 8 * 1024 * 1024;

/** 本人確認書類を提出し、審査待ち（PENDING）にする。 */
export async function submitVerification(
  formData: FormData,
): Promise<{ ok?: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です" };

  const file = formData.get("document");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "本人確認書類の画像を選択してください" };
  }
  const ext = ALLOWED_IMAGE_EXT[file.type];
  if (!ext) return { error: "画像形式は JPEG / PNG / WebP に対応しています" };
  if (file.size > MAX_BYTES) return { error: "画像は8MBまでにしてください" };

  await mkdir(VERIFY_DIR, { recursive: true });
  const name = `${user.id}-${randomUUID()}.${ext}`;
  await writeFile(path.join(VERIFY_DIR, name), Buffer.from(await file.arrayBuffer()));

  await prisma.identityVerification.upsert({
    where: { userId: user.id },
    create: { userId: user.id, status: "PENDING", documentPath: name },
    update: { status: "PENDING", documentPath: name, note: null },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { verificationStatus: "PENDING" },
  });

  revalidatePath("/me");
  revalidatePath("/admin/verifications");
  return { ok: true };
}

/** 運営が本人確認を承認/却下する。 */
export async function reviewVerification(
  userId: string,
  approve: boolean,
  note?: string,
) {
  const admin = await getCurrentUser();
  if (!admin || !isAdmin(admin)) throw new Error("操作権限がありません");

  const status = approve ? "VERIFIED" : "REJECTED";
  await prisma.identityVerification.update({
    where: { userId },
    data: { status, note: note || null },
  });
  await prisma.user.update({ where: { id: userId }, data: { verificationStatus: status } });

  revalidatePath("/admin/verifications");
}
