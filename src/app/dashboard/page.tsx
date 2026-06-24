import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Users,
  MessageCircle,
  MapPin,
  Wallet,
  Inbox,
  Heart,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOrganizer } from "@/lib/session";
import { setRecruiting } from "@/app/actions/circles";
import { coverTheme, feeLabel } from "@/lib/constants";
import { Avatar, ButtonLink } from "@/components/ui";
import { ApplicationMenu } from "@/components/ApplicationMenu";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");
  if (!isOrganizer(user)) redirect("/circles");

  const blockedIds = (
    await prisma.block.findMany({
      where: { blockerId: user.id },
      select: { blockedId: true },
    })
  ).map((b) => b.blockedId);

  const circles = await prisma.circle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      applications: {
        where: blockedIds.length ? { applicantId: { notIn: blockedIds } } : undefined,
        orderBy: { createdAt: "desc" },
        include: {
          applicant: true,
          chatRoom: { include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } } },
        },
      },
    },
  });

  const circle = circles[0] ?? null;
  const apps = circles.flatMap((c) => c.applications);

  // 直近メッセージ順に並べた会話スレッド
  const threads = apps
    .map((a) => ({ app: a, last: a.chatRoom?.messages[0] ?? null }))
    .sort((x, y) => {
      const xt = (x.last?.createdAt ?? x.app.createdAt).getTime();
      const yt = (y.last?.createdAt ?? y.app.createdAt).getTime();
      return yt - xt;
    });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">ダッシュボード</h1>
          <p className="mt-1 text-stone-500">応募者とのメッセージを管理しましょう。</p>
        </div>
        {circle && (
          <ButtonLink href={`/circles/${circle.id}/edit`} variant="secondary">
            サークルを編集
          </ButtonLink>
        )}
      </div>

      {!circle ? (
        <div className="mt-8 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center">
          <p className="font-semibold text-stone-600">まだサークルがありません</p>
          <p className="mt-1 text-sm text-stone-400">サークルを作成して、仲間を募集しましょう。</p>
          <ButtonLink href="/circles/new" className="mt-4">
            <Plus className="h-4 w-4" />
            サークルを作る
          </ButtonLink>
        </div>
      ) : (
        <>
          {/* サークル概要 */}
          <div className="mt-6 rounded-4xl border border-stone-100 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-11 w-11 place-items-center rounded-2xl text-sm font-bold",
                    coverTheme(circle.coverColor).bg,
                    coverTheme(circle.coverColor).text,
                  )}
                >
                  {circle.category.slice(0, 2)}
                </span>
                <div>
                  <Link href={`/circles/${circle.id}`} className="font-extrabold text-stone-800 hover:text-amber-600">
                    {circle.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-stone-400">
                    <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />メンバー{circle.memberCount}人</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{circle.area}</span>
                    <span className="flex items-center gap-0.5"><Wallet className="h-3 w-3" />{feeLabel(circle.hasFee, circle.feeText)}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                    circle.recruiting ? "bg-emerald-100 text-emerald-600" : "bg-stone-200 text-stone-600",
                  )}
                >
                  {circle.recruiting ? "募集中" : "募集停止中"}
                </span>
                <form action={setRecruiting.bind(null, circle.id, !circle.recruiting)}>
                  <button type="submit" className="text-sm font-semibold text-stone-500 hover:text-stone-700">
                    {circle.recruiting ? "停止" : "再開"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* 指標（いいね等は今後追加） */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            <Stat icon={Inbox} label="応募" value={`${apps.length}`} color="bg-sky-100 text-sky-600" />
            <Stat icon={MessageCircle} label="メッセージ" value={`${threads.filter((t) => t.app.chatRoom).length}`} color="bg-amber-100 text-amber-600" />
            <Stat icon={Heart} label="いいね（準備中）" value="—" color="bg-rose-100 text-rose-500" />
          </div>

          {/* メッセージ（メイン） */}
          <section className="mt-8">
            <h2 className="text-xl font-extrabold text-stone-800">メッセージ</h2>
            {threads.length === 0 ? (
              <div className="mt-4 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center text-sm text-stone-400">
                まだ応募・メッセージはありません。サークルをシェアして仲間を集めましょう！
              </div>
            ) : (
              <div className="mt-4 space-y-2">
                {threads.map(({ app, last }) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-2 rounded-3xl border border-stone-100 bg-white p-3 shadow-sm transition hover:border-amber-200"
                  >
                    {app.chatRoom ? (
                      <Link href={`/chat/${app.chatRoom.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={app.applicant.name} image={app.applicant.image} size={48} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline justify-between gap-2">
                            <p className="truncate font-bold text-stone-800">{app.applicant.name}</p>
                            <span className="shrink-0 text-xs text-stone-400">
                              {timeAgo(last?.createdAt ?? app.createdAt)}
                            </span>
                          </div>
                          {app.applicant.affiliation && (
                            <p className="truncate text-xs text-stone-400">{app.applicant.affiliation}</p>
                          )}
                          <p className="truncate text-sm text-stone-500">{last?.content ?? app.message}</p>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={app.applicant.name} image={app.applicant.image} size={48} />
                        <p className="truncate font-bold text-stone-800">{app.applicant.name}</p>
                      </div>
                    )}
                    <ApplicationMenu blockedUserId={app.applicantId} applicantName={app.applicant.name} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-3xl border border-stone-100 bg-white p-4 shadow-sm">
      <span className={cn("grid h-9 w-9 place-items-center rounded-xl", color)}>
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-xl font-extrabold text-stone-800">{value}</p>
      <p className="text-xs text-stone-500">{label}</p>
    </div>
  );
}
