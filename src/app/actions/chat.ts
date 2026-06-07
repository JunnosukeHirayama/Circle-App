"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { publish } from "@/lib/realtime";

const messageSchema = z.object({
  roomId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

/** Verify the user is a participant (applicant or circle owner) of the room. */
async function assertParticipant(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { application: true, circle: { select: { ownerId: true } } },
  });
  if (!room) throw new Error("チャットルームが見つかりません");
  const isOwner = room.circle.ownerId === userId;
  const isApplicant = room.application.applicantId === userId;
  if (!isOwner && !isApplicant) throw new Error("このチャットにアクセスできません");
  return room;
}

export async function sendMessage(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) throw new Error("ログインが必要です");

  const parsed = messageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: "メッセージを入力してください" };
  const { roomId, content } = parsed.data;

  await assertParticipant(roomId, user.id);

  const msg = await prisma.message.create({
    data: { roomId, senderId: user.id, content },
    include: { sender: true },
  });

  publish({
    type: "message",
    roomId,
    message: {
      id: msg.id,
      content: msg.content,
      senderId: msg.senderId,
      senderName: msg.sender.name,
      senderImage: msg.sender.image,
      createdAt: msg.createdAt.toISOString(),
    },
  });

  return { ok: true };
}
