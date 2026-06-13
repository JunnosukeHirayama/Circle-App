"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { publish } from "@/lib/realtime";

const applySchema = z.object({
  circleId: z.string().min(1),
  message: z.string().trim().min(10, "応募メッセージは10文字以上で入力してください").max(1000),
});

export type ApplyState = { error?: string };

/**
 * Apply to a circle. On success:
 *   1. an Application is stored (the org sees the applicant's profile),
 *   2. a ChatRoom is created for the applicant <-> owner,
 *   3. an opening message is posted so the conversation starts immediately.
 */
export async function applyToCircle(
  _prev: ApplyState,
  formData: FormData,
): Promise<ApplyState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const parsed = applySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "入力内容を確認してください" };
  }
  const { circleId, message } = parsed.data;

  if ((user as { role?: string }).role === "ORGANIZER") {
    return { error: "募集者用アカウントでは応募できません" };
  }

  const circle = await prisma.circle.findUnique({ where: { id: circleId } });
  if (!circle) return { error: "サークルが見つかりません" };
  if (circle.ownerId === user.id) return { error: "自分のサークルには応募できません" };
  if (!circle.recruiting) return { error: "このサークルは現在募集を停止しています" };

  const existing = await prisma.application.findUnique({
    where: { circleId_applicantId: { circleId, applicantId: user.id } },
  });
  if (existing) return { error: "すでにこのサークルに応募済みです" };

  let roomId = "";
  await prisma.$transaction(async (tx) => {
    const application = await tx.application.create({
      data: { circleId, applicantId: user.id, message },
    });
    const room = await tx.chatRoom.create({
      data: { circleId, applicationId: application.id },
    });
    roomId = room.id;
    // Seed the chat with the applicant's intro message.
    await tx.message.create({
      data: { roomId: room.id, senderId: user.id, content: message },
    });
  });

  revalidatePath("/dashboard");
  revalidatePath("/me/applications");
  redirect(`/chat/${roomId}`);
}

export async function updateApplicationStatus(
  applicationId: string,
  status: "ACCEPTED" | "REJECTED",
) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    include: { circle: true, chatRoom: true },
  });
  if (!application || application.circle.ownerId !== user.id) {
    throw new Error("操作権限がありません");
  }

  await prisma.application.update({ where: { id: applicationId }, data: { status } });

  if (status === "ACCEPTED") {
    await prisma.circle.update({
      where: { id: application.circleId },
      data: { memberCount: { increment: 1 } },
    });
  }

  // Notify the chat with a system-style message from the owner.
  if (application.chatRoom) {
    const note =
      status === "ACCEPTED"
        ? "🎉 参加が承認されました！これからよろしくお願いします。"
        : "今回はご縁がありませんでした。応募ありがとうございました。";
    const msg = await prisma.message.create({
      data: { roomId: application.chatRoom.id, senderId: user.id, content: note },
      include: { sender: true },
    });
    publish({
      type: "message",
      roomId: application.chatRoom.id,
      message: {
        id: msg.id,
        content: msg.content,
        senderId: msg.senderId,
        senderName: msg.sender.name,
        senderImage: msg.sender.image,
        createdAt: msg.createdAt.toISOString(),
      },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath(`/chat`);
}
