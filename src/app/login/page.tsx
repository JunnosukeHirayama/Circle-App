"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";
import { BrandMark } from "@/components/Logo";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="bg-warm min-h-[calc(100vh-4rem)]" />}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirectParam = params.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { data, error } = await signIn.email({ email, password });
    setLoading(false);
    if (error) {
      if (error.status === 403) {
        setError(
          "メールアドレスが未確認です。登録時にお送りした確認メールのリンクから認証を完了してください（確認メールを再送しました）。",
        );
      } else {
        setError(error.message || "メールアドレスまたはパスワードが正しくありません");
      }
      return;
    }
    const role = (data?.user as { role?: string } | undefined)?.role;
    const dest = redirectParam || (role === "ORGANIZER" ? "/dashboard" : "/circles");
    router.push(dest);
    router.refresh();
  }

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <BrandMark size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-stone-800">おかえりなさい！</h1>
          <p className="mt-1 text-sm text-stone-500">ログインしてサークル活動を続けよう</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
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
          <Field label="パスワード" htmlFor="password">
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "ログイン中..." : "ログイン"}
          </Button>

          <p className="text-center text-sm">
            <Link href="/forgot-password" className="font-semibold text-amber-600 hover:underline">
              パスワードをお忘れですか？
            </Link>
          </p>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          アカウントをお持ちでない方は{" "}
          <Link href="/signup" className="font-semibold text-amber-600 hover:underline">
            新規登録
          </Link>
        </p>
      </div>
    </div>
  );
}
