import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOrganizer } from "@/lib/session";
import { Avatar, Card } from "@/components/ui";
import { ProfileForm } from "@/components/ProfileForm";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?redirect=/me");

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");

  const organizer = isOrganizer(user);

  const applications = organizer
    ? []
    : await prisma.application.findMany({
        where: { applicantId: user.id },
        orderBy: { createdAt: "desc" },
        include: { circle: true, chatRoom: true },
      });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Avatar name={user.name} image={user.image} size={64} />
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">{user.name}</h1>
          <p className="text-sm text-stone-500">{user.email}</p>
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-3 py-0.5 text-xs font-bold",
              organizer ? "bg-violet-100 text-violet-700" : "bg-sky-100 text-sky-700",
            )}
          >
            {organizer ? "募集アカウント" : "一般ユーザー"}
          </span>
        </div>
      </div>

      {/* My applications */}
      <section className={cn("mt-8", organizer && "hidden")}>
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
          <Send className="h-5 w-5 text-amber-500" />
          応募したサークル
        </h2>
        {applications.length === 0 ? (
          <div className="mt-3 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-10 text-center text-sm text-stone-400">
            まだ応募していません。
            <Link href="/circles" className="ml-1 font-semibold text-amber-600 hover:underline">
              サークルを探す
            </Link>
          </div>
        ) : (
          <div className="mt-3 space-y-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex items-center justify-between gap-3 rounded-3xl border border-stone-100 bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <Link href={`/circles/${app.circleId}`} className="font-bold text-stone-800 hover:text-amber-600">
                    {app.circle.name}
                  </Link>
                  <p className="text-xs text-stone-400">{timeAgo(app.createdAt)}に応募</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {app.chatRoom && (
                    <Link
                      href={`/chat/${app.chatRoom.id}`}
                      className="flex h-9 items-center gap-1.5 rounded-full bg-amber-100 px-3 text-sm font-semibold text-amber-600 hover:bg-amber-200"
                    >
                      <MessageCircle className="h-4 w-4" />
                      チャット
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Profile edit */}
      <section className="mt-10">
        <h2 className="text-lg font-extrabold text-stone-800">プロフィール</h2>
        <p className="mt-1 text-sm text-stone-500">
          応募したときに、運営者へ伝わる情報です。
        </p>
        <Card className="mt-3">
          <ProfileForm
            defaults={{
              name: user.name,
              bio: user.bio,
              affiliation: user.affiliation,
              location: user.location,
              emailNotifications: user.emailNotifications,
            }}
          />
        </Card>
      </section>
    </div>
  );
}
