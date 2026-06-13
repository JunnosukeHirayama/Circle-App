import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/ui";
import { ChatRoom, type ChatMessage } from "@/components/ChatRoom";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/chat/${roomId}`);

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      circle: { include: { owner: true } },
      application: { include: { applicant: true } },
      messages: { orderBy: { createdAt: "asc" }, include: { sender: true } },
    },
  });
  if (!room) notFound();

  const iAmOwner = room.circle.ownerId === user.id;
  const iAmApplicant = room.application.applicantId === user.id;
  if (!iAmOwner && !iAmApplicant) redirect("/chat");

  // ブロック関係があるチャットは開けない
  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: room.circle.ownerId, blockedId: room.application.applicantId },
        { blockerId: room.application.applicantId, blockedId: room.circle.ownerId },
      ],
    },
    select: { id: true },
  });
  if (blocked) redirect("/chat");

  const partner = iAmOwner ? room.application.applicant : room.circle.owner;
  // 応募者から見た募集者の表示名はサークル名にする
  const partnerName = iAmOwner ? partner.name : room.circle.name;

  const initialMessages: ChatMessage[] = room.messages.map((m) => ({
    id: m.id,
    content: m.content,
    senderId: m.senderId,
    senderName: m.sender.name,
    senderImage: m.sender.image,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-3xl flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-stone-100 bg-white px-4 py-3 sm:px-6">
        <Link href="/chat" className="grid h-9 w-9 place-items-center rounded-full text-stone-500 hover:bg-stone-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <Avatar name={partnerName} image={partner.image} size={40} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-stone-800">{partnerName}</p>
          {iAmOwner ? (
            <Link href={`/circles/${room.circle.id}`} className="truncate text-xs font-semibold text-amber-600 hover:underline">
              {room.circle.name}
            </Link>
          ) : (
            <span className="truncate text-xs text-stone-400">サークル運営</span>
          )}
        </div>
      </div>

      {/* Context banner */}
      <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 text-xs text-amber-700 sm:px-6">
        <Info className="h-3.5 w-3.5 shrink-0" />
        {iAmOwner
          ? "ここで体験や入会のことを話し合いましょう。"
          : `「${room.circle.name}」に応募しました。運営者とやりとりできます。`}
      </div>

      {/* Conversation */}
      <div className="flex-1 overflow-hidden bg-[#fffdf8]">
        <ChatRoom roomId={roomId} currentUserId={user.id} initialMessages={initialMessages} />
      </div>
    </div>
  );
}
