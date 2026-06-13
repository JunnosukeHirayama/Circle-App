"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOrganizer } from "@/lib/session";

/**
 * Organizer blocks an applicant. After this the applicant can no longer see
 * the organizer's circles in search, nor the chat between them.
 */
export async function blockUser(blockedId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!isOrganizer(user)) throw new Error("操作権限がありません");
  if (blockedId === user.id) throw new Error("自分自身はブロックできません");

  await prisma.block.upsert({
    where: { blockerId_blockedId: { blockerId: user.id, blockedId } },
    create: { blockerId: user.id, blockedId },
    update: {},
  });

  revalidatePath("/dashboard");
  revalidatePath("/chat");
  revalidatePath("/circles");
}

export async function unblockUser(blockedId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  await prisma.block
    .delete({ where: { blockerId_blockedId: { blockerId: user.id, blockedId } } })
    .catch(() => {});

  revalidatePath("/dashboard");
  revalidatePath("/chat");
  revalidatePath("/circles");
}
