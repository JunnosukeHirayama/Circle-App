import Link from "next/link";
import {
  Search,
  MessageCircle,
  Send,
  Sparkles,
  Users,
  Heart,
  ArrowRight,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/ui";
import { CircleCard } from "@/components/CircleCard";
import { CATEGORIES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const circles = await prisma.circle.findMany({
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  return (
    <div className="bg-warm">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-14 sm:px-6 sm:pt-20">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div className="animate-float-in">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-amber-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
              社会人も学生も、つながる場所
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight text-stone-800 sm:text-5xl">
              気になるサークルに、
              <br />
              <span className="text-amber-500">ワンタップ</span>で参加しよう。
            </h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-stone-500">
              活動内容もルールも雰囲気も、ぜんぶ見える。
              応募するとすぐにチャットがはじまるから、はじめの一歩がかんたんです。
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/circles" size="lg">
                <Search className="h-5 w-5" />
                サークルを探す
              </ButtonLink>
              <ButtonLink href="/circles/new" variant="secondary" size="lg">
                サークルを募集する
              </ButtonLink>
            </div>
          </div>

          {/* Decorative card stack */}
          <div className="relative hidden h-80 md:block">
            <div className="absolute right-6 top-2 w-64 rotate-6 rounded-4xl bg-rose-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 text-rose-700">
                <Heart className="h-5 w-5" />
                <span className="font-bold">フットサル仲間募集！</span>
              </div>
              <p className="mt-2 text-sm text-rose-600/80">毎週末、初心者歓迎でゆるく活動中⚽️</p>
            </div>
            <div className="absolute left-2 top-24 w-64 -rotate-3 rounded-4xl bg-sky-200 p-6 shadow-lg">
              <div className="flex items-center gap-2 text-sky-700">
                <Users className="h-5 w-5" />
                <span className="font-bold">読書会サークル</span>
              </div>
              <p className="mt-2 text-sm text-sky-700/80">月1で集まって、好きな本を語ろう📚</p>
            </div>
            <div className="absolute bottom-0 right-12 w-60 rotate-2 rounded-4xl bg-amber-300 p-6 shadow-lg">
              <div className="flex items-center gap-2 text-amber-800">
                <MessageCircle className="h-5 w-5" />
                <span className="font-bold">応募すぐチャット</span>
              </div>
              <p className="mt-2 text-sm text-amber-800/80">気軽に質問できる安心感✨</p>
            </div>
          </div>
        </div>

        {/* Category chips */}
        <div className="mt-12 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c}
              href={`/circles?category=${encodeURIComponent(c)}`}
              className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-stone-600 transition hover:bg-amber-100 hover:text-amber-700"
            >
              {c}
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold text-stone-800 sm:text-3xl">
          応募までの流れは、たったの3ステップ
        </h2>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            { icon: Search, title: "探す", desc: "カテゴリやエリアから、自分に合うサークルを見つけよう。", color: "bg-sky-100 text-sky-600" },
            { icon: Send, title: "応募する", desc: "ひとことメッセージを添えて応募。プロフィールが運営に届きます。", color: "bg-rose-100 text-rose-600" },
            { icon: MessageCircle, title: "チャット", desc: "応募と同時に専用チャットが開設。今後の流れをその場で相談。", color: "bg-amber-100 text-amber-600" },
          ].map((s, i) => (
            <div
              key={s.title}
              className="relative rounded-4xl border border-stone-100 bg-white p-7 shadow-sm"
            >
              <span className="absolute right-6 top-5 text-5xl font-black text-stone-100">
                {i + 1}
              </span>
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-extrabold text-stone-800">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Latest circles */}
      {circles.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-extrabold text-stone-800">新着サークル</h2>
            <Link
              href="/circles"
              className="flex items-center gap-1 text-sm font-semibold text-amber-600 transition-all hover:gap-2"
            >
              すべて見る <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {circles.map((c) => (
              <CircleCard key={c.id} circle={c} />
            ))}
          </div>
        </section>
      )}

      {/* Two-sided CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-4xl bg-amber-400 p-8 text-amber-950">
            <h3 className="text-2xl font-extrabold">サークルを探している方へ</h3>
            <p className="mt-2 text-amber-900/80">
              無料で登録して、気になるサークルにすぐ応募。新しい仲間との出会いが待っています。
            </p>
            <ButtonLink href="/signup" variant="secondary" size="lg" className="mt-6">
              無料ではじめる
            </ButtonLink>
          </div>
          <div className="rounded-4xl bg-stone-800 p-8 text-white">
            <h3 className="text-2xl font-extrabold">メンバーを募集したい方へ</h3>
            <p className="mt-2 text-stone-300">
              サークル情報を掲載して、ぴったりの仲間を見つけよう。応募者とはチャットで直接やりとり。
            </p>
            <ButtonLink href="/circles/new" size="lg" className="mt-6">
              サークルを掲載する
            </ButtonLink>
          </div>
        </div>
      </section>

      <footer className="border-t border-amber-100 py-8 text-center text-sm text-stone-400">
        <p>© 2026 Circle — みんなのサークル募集アプリ</p>
      </footer>
    </div>
  );
}
