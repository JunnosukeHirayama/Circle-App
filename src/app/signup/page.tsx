"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { signUp } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    setLoading(true);
    const { error } = await signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      setError(error.message || "登録に失敗しました。別のメールアドレスをお試しください");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-amber-950">
            <Sparkles className="h-6 w-6" />
          </span>
          <h1 className="text-2xl font-extrabold text-stone-800">はじめよう！</h1>
          <p className="mt-1 text-sm text-stone-500">無料登録して、サークルとつながろう</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <Field label="お名前 / ニックネーム" htmlFor="name">
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="たろう"
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

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "登録中..." : "無料で登録する"}
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
