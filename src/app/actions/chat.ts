"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { publish } from "@/lib/realtime";
import { sendEmail, newMessageEmail } from "@/lib/email";

const messageSchema = z.object({
  roomId: z.string().min(1),
  content: z.string().trim().min(1).max(2000),
});

/** Verify the user is a participant (applicant or circle owner) of the room. */
async function loadRoom(roomId: string, userId: string) {
  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      application: { include: { applicant: true } },
      circle: { include: { owner: true } },
    },
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

  const room = await loadRoom(roomId, user.id);

  // ブロック関係があれば送信不可
  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: room.circle.ownerId, blockedId: room.application.applicantId },
        { blockerId: room.application.applicantId, blockedId: room.circle.ownerId },
      ],
    },
    select: { id: true },
  });
  if (blocked) return { error: "このチャットは利用できません" };

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

  // 受信者（相手側）へメール通知
  const senderIsOwner = room.circle.ownerId === user.id;
  const recipient = senderIsOwner ? room.application.applicant : room.circle.owner;
  if (recipient.emailNotifications && recipient.email) {
    const { subject, text } = newMessageEmail({
      recipientRole: senderIsOwner ? "APPLICANT" : "ORGANIZER",
      circleName: room.circle.name,
      applicantName: room.application.applicant.name,
      roomUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/chat/${roomId}`,
    });
    // 送信失敗してもチャット自体は成功させる
    void sendEmail({ to: recipient.email, subject, text });
  }

  return { ok: true };
}
