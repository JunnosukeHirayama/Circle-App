import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Users,
  ScrollText,
  Sparkles,
  Pencil,
  MessageCircle,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { coverTheme, audienceMeta } from "@/lib/constants";
import { Avatar, ButtonLink, Card } from "@/components/ui";
import { ApplyForm } from "@/components/ApplyForm";
import { CircleGallery } from "@/components/CircleGallery";
import { cn } from "@/lib/utils";

export default async function CircleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const circle = await prisma.circle.findUnique({
    where: { id },
    include: { owner: true, _count: { select: { applications: true } } },
  });
  if (!circle) notFound();

  const user = await getCurrentUser();
  const isOwner = user?.id === circle.ownerId;

  const myApplication = user
    ? await prisma.application.findUnique({
        where: { circleId_applicantId: { circleId: id, applicantId: user.id } },
        include: { chatRoom: true },
      })
    : null;

  const theme = coverTheme(circle.coverColor);
  const full = circle.capacity != null && circle.memberCount >= circle.capacity;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Cover / gallery */}
      {circle.images.length > 0 ? (
        <CircleGallery images={circle.images} name={circle.name} />
      ) : (
        <div className={cn("relative h-40 overflow-hidden rounded-4xl sm:h-52", theme.bg)}>
          <div className={cn("absolute -right-10 -top-10 h-48 w-48 rounded-full opacity-50", theme.solid)} />
          <div className={cn("absolute right-24 top-16 h-24 w-24 rounded-full opacity-40", theme.solid)} />
          <span className={cn("absolute left-6 top-6 rounded-full bg-white/85 px-4 py-1.5 text-sm font-bold", theme.text)}>
            {circle.category}
          </span>
        </div>
      )}

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-6">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-extrabold text-stone-800">{circle.name}</h1>
              {isOwner && (
                <ButtonLink href={`/circles/${circle.id}/edit`} variant="secondary" size="sm">
                  <Pencil className="h-4 w-4" />
                  編集
                </ButtonLink>
              )}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-500">
              <span className={cn("rounded-full px-3 py-1 text-xs font-bold", audienceMeta(circle.audience).style)}>
                {audienceMeta(circle.audience).icon} {audienceMeta(circle.audience).label}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                メンバー {circle.memberCount}
                {circle.capacity != null && ` / ${circle.capacity}`}人
              </span>
              {circle.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {circle.location}
                </span>
              )}
              <span
                className={cn(
                  "rounded-full px-3 py-0.5 text-xs font-semibold",
                  full ? "bg-stone-100 text-stone-500" : "bg-emerald-100 text-emerald-600",
                )}
              >
                {full ? "満員" : "メンバー募集中"}
              </span>
            </div>
            {circle.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {circle.tags.map((t) => (
                  <span key={t} className="rounded-full bg-stone-100 px-3 py-1 text-xs text-stone-500">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
              <Sparkles className="h-5 w-5 text-amber-500" />
              活動内容
            </h2>
            <p className="mt-3 whitespace-pre-wrap leading-relaxed text-stone-600">
              {circle.description}
            </p>
          </Card>

          {circle.rules && (
            <Card>
              <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
                <ScrollText className="h-5 w-5 text-amber-500" />
                ルール・お約束
              </h2>
              <p className="mt-3 whitespace-pre-wrap leading-relaxed text-stone-600">
                {circle.rules}
              </p>
            </Card>
          )}

          {/* Owner */}
          <Card>
            <h2 className="text-sm font-semibold text-stone-400">運営者</h2>
            <div className="mt-3 flex items-center gap-3">
              <Avatar name={circle.owner.name} image={circle.owner.image} size={48} />
              <div>
                <p className="font-bold text-stone-800">{circle.owner.name}</p>
                {circle.owner.affiliation && (
                  <p className="text-sm text-stone-500">{circle.owner.affiliation}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Apply panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card>
            {isOwner ? (
              <div className="text-center">
                <p className="text-sm text-stone-500">あなたが運営するサークルです</p>
                <ButtonLink href="/dashboard" className="mt-4 w-full">
                  応募者を確認する（{circle._count.applications}件）
                </ButtonLink>
              </div>
            ) : myApplication ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="mt-3 font-bold text-stone-800">応募済みです</p>
                <p className="mt-1 text-sm text-stone-500">
                  チャットで運営者とやりとりできます。
                </p>
                {myApplication.chatRoom && (
                  <ButtonLink href={`/chat/${myApplication.chatRoom.id}`} className="mt-4 w-full">
                    <MessageCircle className="h-4 w-4" />
                    チャットを開く
                  </ButtonLink>
                )}
              </div>
            ) : !user ? (
              <div className="text-center">
                <p className="font-bold text-stone-800">このサークルに参加するには</p>
                <p className="mt-1 text-sm text-stone-500">
                  ログインして応募メッセージを送りましょう。
                </p>
                <ButtonLink
                  href={`/login?redirect=/circles/${circle.id}`}
                  className="mt-4 w-full"
                >
                  ログインして応募
                </ButtonLink>
                <Link
                  href="/signup"
                  className="mt-3 inline-block text-sm font-semibold text-amber-600 hover:underline"
                >
                  新規登録はこちら
                </Link>
              </div>
            ) : full ? (
              <p className="py-4 text-center text-sm text-stone-500">
                現在このサークルは満員です。
              </p>
            ) : (
              <>
                <h3 className="mb-3 font-extrabold text-stone-800">応募メッセージ</h3>
                <ApplyForm circleId={circle.id} />
              </>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
