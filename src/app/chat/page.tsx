import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { Avatar } from "@/components/ui";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ChatListPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/chat");

  const rooms = await prisma.chatRoom.findMany({
    where: {
      OR: [
        { circle: { ownerId: user.id } },
        { application: { applicantId: user.id } },
      ],
    },
    include: {
      circle: { include: { owner: true } },
      application: { include: { applicant: true } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  // Sort by most recent message.
  rooms.sort((a, b) => {
    const at = a.messages[0]?.createdAt ?? a.createdAt;
    const bt = b.messages[0]?.createdAt ?? b.createdAt;
    return bt.getTime() - at.getTime();
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-extrabold text-stone-800">チャット</h1>
      <p className="mt-1 text-stone-500">応募したサークル・応募してきた人とのやりとり。</p>

      {rooms.length === 0 ? (
        <div className="mt-8 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-16 text-center">
          <MessageCircle className="mx-auto h-10 w-10 text-stone-300" />
          <p className="mt-3 font-semibold text-stone-600">まだチャットがありません</p>
          <p className="mt-1 text-sm text-stone-400">
            サークルに応募すると、ここにチャットが表示されます。
          </p>
          <Link
            href="/circles"
            className="mt-5 inline-block rounded-full bg-amber-400 px-6 py-3 text-sm font-semibold text-amber-950 hover:bg-amber-300"
          >
            サークルを探す
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-2">
          {rooms.map((room) => {
            const iAmOwner = room.circle.ownerId === user.id;
            const partner = iAmOwner ? room.application.applicant : room.circle.owner;
            const last = room.messages[0];
            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className="flex items-center gap-3 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:bg-amber-50/40"
              >
                <Avatar name={partner.name} image={partner.image} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate font-bold text-stone-800">{partner.name}</p>
                    {last && (
                      <span className="shrink-0 text-xs text-stone-400">{timeAgo(last.createdAt)}</span>
                    )}
                  </div>
                  <p className="truncate text-xs font-semibold text-amber-600">{room.circle.name}</p>
                  {last && <p className="truncate text-sm text-stone-500">{last.content}</p>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
