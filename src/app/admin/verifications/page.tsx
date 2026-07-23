import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { BadgeCheck, Check, X } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isAdmin } from "@/lib/session";
import { reviewVerification } from "@/app/actions/verification";
import { timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/admin/verifications");
  if (!isAdmin(user)) notFound();

  const pending = await prisma.identityVerification.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { name: true, email: true, role: true } } },
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-sky-600">
          <BadgeCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-2xl font-extrabold text-stone-800">本人確認の審査</h1>
          <p className="text-sm text-stone-500">運営者のみ閲覧できます。</p>
        </div>
      </div>

      <nav className="mt-4 flex gap-2 text-sm font-semibold">
        <Link href="/admin/reports" className="rounded-full bg-stone-100 px-4 py-1.5 text-stone-600 hover:bg-stone-200">
          通報
        </Link>
        <span className="rounded-full bg-amber-100 px-4 py-1.5 text-amber-700">本人確認</span>
      </nav>

      <p className="mt-6 text-sm text-stone-400">{pending.length}件の審査待ち</p>

      {pending.length === 0 ? (
        <div className="mt-3 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center text-sm text-stone-400">
          審査待ちの申請はありません。
        </div>
      ) : (
        <div className="mt-3 space-y-4">
          {pending.map((v) => (
            <div key={v.id} className="rounded-3xl border border-stone-100 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-stone-800">{v.user.name}</p>
                  <p className="text-xs text-stone-400">
                    {v.user.email} ・ {v.user.role === "ORGANIZER" ? "募集" : "一般"} ・ {timeAgo(v.createdAt)}
                  </p>
                </div>
              </div>

              {/* 提出書類（管理者のみ閲覧可） */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/verify/doc/${v.documentPath}`}
                alt="本人確認書類"
                className="mt-3 max-h-72 rounded-2xl border border-stone-100 object-contain"
              />

              <div className="mt-4 flex gap-2">
                <form action={reviewVerification.bind(null, v.userId, true, undefined)}>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400">
                    <Check className="h-4 w-4" />
                    承認
                  </button>
                </form>
                <form action={reviewVerification.bind(null, v.userId, false, "書類を確認できませんでした")}>
                  <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-stone-500 ring-1 ring-stone-200 transition hover:bg-stone-50">
                    <X className="h-4 w-4" />
                    却下
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
