"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Megaphone, MailCheck } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";
import { BrandMark } from "@/components/Logo";
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
  const [role, setRole] = useState<Role>("APPLICANT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isOrg = role === "ORGANIZER";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    setLoading(true);
    const { error: signUpError } = await signUp.email({
      email,
      password,
      name,
      role,
      callbackURL: isOrg ? "/dashboard" : "/circles",
    });
    setLoading(false);
    if (signUpError) {
      setError(signUpError.message || "登録に失敗しました。別のメールアドレスをお試しください");
      return;
    }
    setSent(true);
  }

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <BrandMark size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-stone-800">はじめよう！</h1>
          <p className="mt-1 text-sm text-stone-500">無料登録して、サークルとつながろう</p>
        </div>

        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto h-12 w-12 text-emerald-500" />
            <h2 className="mt-4 text-lg font-extrabold text-stone-800">確認メールを送信しました</h2>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              <span className="font-semibold text-stone-700">{email}</span> 宛にメールを送りました。
              メール内のリンクをクリックして認証を完了すると、ログインできるようになります。
            </p>
            <p className="mt-2 text-xs text-stone-400">
              メールが届かない場合は、迷惑メールフォルダもご確認ください。
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              ログインへ
            </Link>
          </div>
        ) : (
          <>
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
              <Field
                label={isOrg ? "サークル名" : "お名前 / ニックネーム"}
                htmlFor="name"
                hint={isOrg ? "アカウント名になります。認証後に詳しいサークル情報を登録します" : undefined}
              >
                <Input
                  id="name"
                  required
                  maxLength={60}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isOrg ? "例：週末フットサルクラブ" : "たろう"}
                />
              </Field>
              <Field label="メールアドレス" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </Field>
              <Field label="パスワード" htmlFor="password" hint="8文字以上で設定してください">
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </Field>

              {error && (
                <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
              )}

              <p className="text-center text-xs leading-relaxed text-stone-400">
                登録すると、
                <a href="/terms" target="_blank" className="font-semibold text-amber-600 hover:underline">
                  利用規約
                </a>
                と
                <a href="/privacy" target="_blank" className="font-semibold text-amber-600 hover:underline">
                  プライバシーポリシー
                </a>
                に同意したものとみなされます。
              </p>

              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                {loading ? "送信中..." : "確認メールを送って登録"}
              </Button>
            </form>
          </>
        )}

        {!sent && (
          <p className="mt-6 text-center text-sm text-stone-500">
            すでにアカウントをお持ちの方は{" "}
            <Link href="/login" className="font-semibold text-amber-600 hover:underline">
              ログイン
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
