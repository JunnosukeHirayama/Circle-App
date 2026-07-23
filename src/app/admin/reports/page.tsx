import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ShieldAlert, ExternalLink } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/reports");
  if (!isAdmin(user)) notFound();

  const reports = await prisma.report.findMany({
    orderBy: { createdAt: "desc" },
    include: { reporter: { select: { name: true, email: true } } },
    take: 200,
  });

  // 対象の名前を解決
  const circleIds = reports.filter((r) => r.targetType === "CIRCLE").map((r) => r.targetId);
  const userIds = reports.filter((r) => r.targetType === "USER").map((r) => r.targetId);
  const circles = await prisma.circle.findMany({
    where: { id: { in: circleIds } },
    select: { id: true, name: true },
  });
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const circleName = new Map(circles.map((c) => [c.id, c.name]));
  const userName = new Map(users.map((u) => [u.id, u.name]));

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-600">
          <ShieldAlert className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">通報の管理</h1>
          <p className="text-sm text-stone-500">運営者のみ閲覧できます。</p>
        </div>
      </div>

      <nav className="mt-4 flex gap-2 text-sm font-semibold">
        <span className="rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">通報</span>
        <Link href="/admin/verifications" className="rounded-full bg-stone-100 px-4 py-1.5 text-stone-600 hover:bg-stone-200">
          本人確認
        </Link>
      </nav>

      <p className="mt-6 text-sm text-stone-400">{reports.length}件の通報</p>

      {reports.length === 0 ? (
        <div className="mt-3 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center text-sm text-stone-400">
          通報はまだありません。
        </div>
      ) : (
        <div className="mt-3 space-y-3">
          {reports.map((r) => {
            const isCircle = r.targetType === "CIRCLE";
            const name = isCircle
              ? circleName.get(r.targetId)
              : userName.get(r.targetId);
            return (
              <div key={r.id} className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700">
                    {r.reason}
                  </span>
                  <span className="text-xs text-stone-400">{timeAgo(r.createdAt)}</span>
                </div>
                <p className="mt-3 text-sm text-stone-700">
                  対象：
                  <span className="font-semibold">
                    {isCircle ? "サークル" : "ユーザー"}「{name ?? "（削除済み）"}」
                  </span>
                  {isCircle && circleName.has(r.targetId) && (
                    <Link
                      href={`/circles/${r.targetId}`}
                      className="ml-2 inline-flex items-center gap-0.5 text-xs font-semibold text-amber-600 hover:underline"
                    >
                      開く <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </p>
                {r.detail && (
                  <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-stone-50 px-4 py-2 text-sm text-stone-600">
                    {r.detail}
                  </p>
                )}
                <p className="mt-2 text-xs text-stone-400">
                  通報者：{r.reporter.name}（{r.reporter.email}）
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
