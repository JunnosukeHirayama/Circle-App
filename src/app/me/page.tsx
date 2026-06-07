import Link from "next/link";
import { redirect } from "next/navigation";
import { MessageCircle, Send } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { APPLICATION_STATUS_LABEL, APPLICATION_STATUS_STYLE } from "@/lib/constants";
import { Avatar, Card } from "@/components/ui";
import { ProfileForm } from "@/components/ProfileForm";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect("/login?redirect=/me");

  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
  if (!user) redirect("/login");

  const applications = await prisma.application.findMany({
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
        </div>
      </div>

      {/* My applications */}
      <section className="mt-8">
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
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", APPLICATION_STATUS_STYLE[app.status])}>
                    {APPLICATION_STATUS_LABEL[app.status]}
                  </span>
                  {app.chatRoom && (
                    <Link
                      href={`/chat/${app.chatRoom.id}`}
                      className="grid h-9 w-9 place-items-center rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200"
                    >
                      <MessageCircle className="h-4 w-4" />
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
            }}
          />
        </Card>
      </section>
    </div>
  );
}
