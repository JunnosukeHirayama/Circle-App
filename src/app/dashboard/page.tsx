import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  Users,
  Inbox,
  MessageCircle,
  Check,
  X,
  MapPin,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updateApplicationStatus } from "@/app/actions/applications";
import {
  APPLICATION_STATUS_LABEL,
  APPLICATION_STATUS_STYLE,
  coverTheme,
} from "@/lib/constants";
import { Avatar, ButtonLink } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const circles = await prisma.circle.findMany({
    where: { ownerId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { applications: true } },
      applications: {
        orderBy: { createdAt: "desc" },
        include: { applicant: true, chatRoom: true },
      },
    },
  });

  const allApplications = circles.flatMap((c) =>
    c.applications.map((a) => ({ ...a, circleName: c.name })),
  );
  const pendingCount = allApplications.filter((a) => a.status === "PENDING").length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-extrabold text-stone-800">ダッシュボード</h1>
          <p className="mt-1 text-stone-500">あなたのサークルと応募状況を管理しましょう。</p>
        </div>
        <ButtonLink href="/circles/new">
          <Plus className="h-4 w-4" />
          サークルを作る
        </ButtonLink>
      </div>

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat icon={Users} label="運営サークル" value={circles.length} color="bg-amber-100 text-amber-600" />
        <Stat icon={Inbox} label="累計応募" value={allApplications.length} color="bg-sky-100 text-sky-600" />
        <Stat icon={MessageCircle} label="未対応の応募" value={pendingCount} color="bg-rose-100 text-rose-600" />
      </div>

      {/* My circles */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-stone-800">あなたのサークル</h2>
        {circles.length === 0 ? (
          <div className="mt-4 rounded-4xl border border-dashed border-stone-200 bg-white/50 py-12 text-center">
            <p className="font-semibold text-stone-600">まだサークルがありません</p>
            <p className="mt-1 text-sm text-stone-400">最初のサークルを作って、仲間を募集しましょう。</p>
            <ButtonLink href="/circles/new" className="mt-4">
              <Plus className="h-4 w-4" />
              サークルを作る
            </ButtonLink>
          </div>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {circles.map((c) => {
              const theme = coverTheme(c.coverColor);
              return (
                <div key={c.id} className="rounded-4xl border border-stone-100 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className={cn("grid h-11 w-11 place-items-center rounded-2xl text-sm font-bold", theme.bg, theme.text)}>
                        {c.category.slice(0, 2)}
                      </span>
                      <div>
                        <Link href={`/circles/${c.id}`} className="font-extrabold text-stone-800 hover:text-amber-600">
                          {c.name}
                        </Link>
                        <p className="flex items-center gap-2 text-xs text-stone-400">
                          <span className="flex items-center gap-0.5"><Users className="h-3 w-3" />{c.memberCount}人</span>
                          {c.location && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{c.location}</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-sm text-stone-500">応募 {c._count.applications}件</span>
                    <Link href={`/circles/${c.id}/edit`} className="text-sm font-semibold text-amber-600 hover:underline">
                      編集する
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

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
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", APPLICATION_STATUS_STYLE[app.status])}>
                    {APPLICATION_STATUS_LABEL[app.status]}
                  </span>
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
                  {app.status === "PENDING" && (
                    <>
                      <form action={updateApplicationStatus.bind(null, app.id, "ACCEPTED")}>
                        <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold text-white transition hover:bg-emerald-400">
                          <Check className="h-4 w-4" />
                          参加OK
                        </button>
                      </form>
                      <form action={updateApplicationStatus.bind(null, app.id, "REJECTED")}>
                        <button className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-stone-500 ring-1 ring-stone-200 transition hover:bg-stone-50">
                          <X className="h-4 w-4" />
                          見送り
                        </button>
                      </form>
                    </>
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

function Stat({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="rounded-4xl border border-stone-100 bg-white p-5 shadow-sm">
      <span className={cn("grid h-10 w-10 place-items-center rounded-2xl", color)}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-2xl font-extrabold text-stone-800">{value}</p>
      <p className="text-sm text-stone-500">{label}</p>
    </div>
  );
}
