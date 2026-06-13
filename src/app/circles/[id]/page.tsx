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
  Wallet,
  Briefcase,
  PauseCircle,
  Info,
  Target,
  Repeat,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, isOrganizer } from "@/lib/session";
import { coverTheme, audienceMeta, feeLabel } from "@/lib/constants";
import { setRecruiting } from "@/app/actions/circles";
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

  // ブロックされている場合は、その募集者のサークルは見えない
  if (user && user.id !== circle.ownerId) {
    const blocked = await prisma.block.findUnique({
      where: { blockerId_blockedId: { blockerId: circle.ownerId, blockedId: user.id } },
    });
    if (blocked) notFound();
  }

  const isOwner = user?.id === circle.ownerId;
  const userIsOrganizer = isOrganizer(user);

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
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                {circle.category}
              </span>
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-semibold",
                  !circle.recruiting
                    ? "bg-stone-200 text-stone-600"
                    : full
                      ? "bg-stone-100 text-stone-500"
                      : "bg-emerald-100 text-emerald-600",
                )}
              >
                {!circle.recruiting ? "募集停止中" : full ? "満員" : "メンバー募集中"}
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

          {/* 基本情報 */}
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
              <Info className="h-5 w-5 text-amber-500" />
              基本情報
            </h2>
            <dl className="mt-4 divide-y divide-stone-100">
              <InfoRow icon={Target} label="対象者">
                <span className={cn("rounded-full px-2.5 py-0.5 text-sm font-bold", audienceMeta(circle.audience).style)}>
                  {audienceMeta(circle.audience).icon} {audienceMeta(circle.audience).label}
                </span>
              </InfoRow>
              <InfoRow icon={Repeat} label="活動頻度">
                {circle.frequency}
              </InfoRow>
              <InfoRow icon={MapPin} label="活動場所">
                {circle.area}
                {circle.location && (
                  <span className="text-stone-400">（{circle.location}）</span>
                )}
              </InfoRow>
              <InfoRow icon={Wallet} label="会費">
                {feeLabel(circle.hasFee, circle.feeText)}
              </InfoRow>
              <InfoRow icon={Users} label="メンバー">
                {circle.memberCount}
                {circle.capacity != null && ` / ${circle.capacity}`}人
              </InfoRow>
            </dl>
          </Card>

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
                <form
                  action={setRecruiting.bind(null, circle.id, !circle.recruiting)}
                  className="mt-3"
                >
                  <button
                    type="submit"
                    className={cn(
                      "inline-flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition",
                      circle.recruiting
                        ? "bg-stone-100 text-stone-600 hover:bg-stone-200"
                        : "bg-emerald-500 text-white hover:bg-emerald-400",
                    )}
                  >
                    <PauseCircle className="h-4 w-4" />
                    {circle.recruiting ? "募集を停止する" : "募集を再開する"}
                  </button>
                </form>
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
            ) : userIsOrganizer ? (
              <div className="text-center">
                <Briefcase className="mx-auto h-9 w-9 text-stone-300" />
                <p className="mt-3 font-bold text-stone-700">募集者用アカウントでは応募できません</p>
                <p className="mt-1 text-sm text-stone-500">
                  サークルに応募するには、一般ユーザー用アカウントでご利用ください。
                </p>
              </div>
            ) : !circle.recruiting ? (
              <div className="text-center">
                <PauseCircle className="mx-auto h-9 w-9 text-stone-300" />
                <p className="mt-3 font-bold text-stone-700">現在は募集を停止しています</p>
                <p className="mt-1 text-sm text-stone-500">
                  募集が再開されるまでお待ちください。
                </p>
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

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="flex items-center gap-2 text-sm font-semibold text-stone-500">
        <Icon className="h-4 w-4 text-stone-400" />
        {label}
      </dt>
      <dd className="text-right text-sm font-bold text-stone-800">{children}</dd>
    </div>
  );
}
