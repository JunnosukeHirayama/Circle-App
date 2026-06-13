"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Search, Megaphone } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { registerCircle } from "@/app/actions/circles";
import { Button, Field, Input } from "@/components/ui";
import { CircleFields } from "@/components/CircleFields";
import { cn } from "@/lib/utils";

type Role = "APPLICANT" | "ORGANIZER";

const ROLE_OPTIONS: { value: Role; title: string; desc: string; icon: typeof Search }[] = [
  {
    value: "APPLICANT",
    title: "サークルを探す",
    desc: "気になるサークルに応募して参加したい",
    icon: Search,
  },
  {
    value: "ORGANIZER",
    title: "メンバーを募集する",
    desc: "サークルを掲載して仲間を集めたい",
    icon: Megaphone,
  },
];

export default function SignupPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("APPLICANT");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");
    const name = String(fd.get("name") ?? "");

    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }

    setLoading(true);
    const { error: signUpError } = await signUp.email({ email, password, name, role });
    if (signUpError) {
      setLoading(false);
      setError(signUpError.message || "登録に失敗しました。別のメールアドレスをお試しください");
      return;
    }

    if (role === "ORGANIZER") {
      // アカウント作成と同時にサークルを登録
      const res = await registerCircle(fd);
      if (res?.error) {
        setLoading(false);
        setError(`アカウントは作成されました。サークル情報の登録でエラー: ${res.error}`);
        return;
      }
      router.push("/dashboard");
    } else {
      router.push("/circles");
    }
    router.refresh();
  }

  const isOrg = role === "ORGANIZER";

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div
        className={cn(
          "w-full animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10",
          isOrg ? "max-w-2xl" : "max-w-md",
        )}
      >
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-amber-950">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-extrabold text-stone-800">はじめよう！</h1>
          <p className="mt-1 text-sm text-stone-500">無料登録して、サークルとつながろう</p>
        </div>

        {/* アカウント種別 */}
        <div className="mb-5">
          <p className="mb-2 text-sm font-semibold text-stone-700">どちらで利用しますか？</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {ROLE_OPTIONS.map((o) => (
              <button
                type="button"
                key={o.value}
                onClick={() => setRole(o.value)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left transition",
                  role === o.value
                    ? "border-amber-400 bg-amber-50"
                    : "border-stone-200 hover:border-amber-200",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
                    role === o.value ? "bg-amber-400 text-amber-950" : "bg-stone-100 text-stone-500",
                  )}
                >
                  <o.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-bold text-stone-800">{o.title}</span>
                  <span className="block text-xs text-stone-500">{o.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* アカウント情報 */}
          <div className="space-y-4">
            <Field label="メールアドレス" htmlFor="email">
              <Input id="email" name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
            </Field>
            <Field label="パスワード" htmlFor="password" hint="8文字以上で設定してください">
              <Input id="password" name="password" type="password" required autoComplete="new-password" placeholder="••••••••" />
            </Field>
          </div>

          {isOrg ? (
            <>
              <div className="!mt-7 border-t border-stone-100 pt-6">
                <h2 className="mb-1 text-lg font-extrabold text-stone-800">サークル情報</h2>
                <p className="mb-4 text-sm text-stone-500">
                  サークル名がそのままアカウント名になります。写真は登録後に追加できます。
                </p>
              </div>
              <CircleFields includeImages={false} showPublish />
            </>
          ) : (
            <Field label="お名前 / ニックネーム" htmlFor="name">
              <Input id="name" name="name" required maxLength={40} placeholder="たろう" />
            </Field>
          )}

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "登録中..." : isOrg ? "サークルを登録して始める" : "無料で登録する"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="font-semibold text-amber-600 hover:underline">
            ログイン
          </Link>
        </p>
      </div>
    </div>
  );
}
