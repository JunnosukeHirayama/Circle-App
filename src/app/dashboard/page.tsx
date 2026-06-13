import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Users,
  MessageCircle,
  MapPin,
  Wallet,
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

  // ブロック済みの応募者は一覧から除外する
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
      _count: { select: { applications: true } },
      applications: {
        where: blockedIds.length ? { applicantId: { notIn: blockedIds } } : undefined,
        orderBy: { createdAt: "desc" },
        include: { applicant: true, chatRoom: true },
      },
    },
  });

  const circle = circles[0] ?? null;
  const allApplications = circles.flatMap((c) =>
    c.applications.map((a) => ({ ...a, circleName: c.name })),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">ダッシュボード</h1>
          <p className="mt-1 text-stone-500">あなたのサークルの応募状況を管理しましょう。</p>
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
          {/* 自分のサークル概要 */}
          <div className="mt-6 rounded-4xl border border-stone-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-2xl text-sm font-bold",
                    coverTheme(circle.coverColor).bg,
                    coverTheme(circle.coverColor).text,
                  )}
                >
                  {circle.category.slice(0, 2)}
                </span>
                <div>
                  <Link href={`/circles/${circle.id}`} className="text-lg font-extrabold text-stone-800 hover:text-amber-600">
                    {circle.name}
                  </Link>
                  <p className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-400">
                    <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{circle.memberCount}{circle.capacity != null && ` / ${circle.capacity}`}人</span>
                    <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{circle.area}</span>
                    <span className="flex items-center gap-0.5"><Wallet className="h-3 w-3" />{feeLabel(circle.hasFee, circle.feeText)}</span>
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-3 py-1 text-xs font-semibold",
                  circle.recruiting ? "bg-emerald-100 text-emerald-600" : "bg-stone-200 text-stone-600",
                )}
              >
                {circle.recruiting ? "募集中" : "募集停止中"}
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-4">
              <span className="text-sm text-stone-500">
                累計応募 <span className="font-bold text-stone-800">{allApplications.length}</span> 件
              </span>
              <div className="flex items-center gap-4">
                <form action={setRecruiting.bind(null, circle.id, !circle.recruiting)}>
                  <button type="submit" className="text-sm font-semibold text-stone-500 hover:text-stone-700">
                    {circle.recruiting ? "募集を停止" : "募集を再開"}
                  </button>
                </form>
                <Link href={`/circles/${circle.id}`} className="text-sm font-semibold text-amber-600 hover:underline">
                  サークルを見る
                </Link>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Applications */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-stone-800">届いた応募</h2>
        {allApplications.length === 0 ? (
          <div className="mt-4 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center text-sm text-stone-400">
            まだ応募はありません。サークルをシェアして応募を集めましょう！
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {allApplications.map((app) => (
              <div key={app.id} className="rounded-4xl border border-stone-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <Avatar name={app.applicant.name} image={app.applicant.image} size={48} />
                    <div>
                      <p className="font-bold text-stone-800">{app.applicant.name}</p>
                      {app.applicant.affiliation && (
                        <p className="text-sm text-stone-500">{app.applicant.affiliation}</p>
                      )}
                      <p className="mt-0.5 text-xs text-stone-400">
                        「{app.circleName}」へ応募 ・ {timeAgo(app.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ApplicationMenu
                    blockedUserId={app.applicantId}
                    applicantName={app.applicant.name}
                  />
                </div>

                {app.applicant.bio && (
                  <p className="mt-3 rounded-2xl bg-stone-50 px-4 py-2 text-sm text-stone-500">
                    {app.applicant.bio}
                  </p>
                )}
                <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-amber-50 px-4 py-3 text-sm text-stone-700">
                  {app.message}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {app.chatRoom && (
                    <ButtonLink href={`/chat/${app.chatRoom.id}`} variant="secondary" size="sm">
                      <MessageCircle className="h-4 w-4" />
                      チャット
                    </ButtonLink>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
