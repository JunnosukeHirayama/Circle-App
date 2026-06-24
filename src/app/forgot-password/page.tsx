"use client";

import { useState } from "react";
import Link from "next/link";
import { MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";
import { BrandMark } from "@/components/Logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      setError(error.message || "送信に失敗しました");
      return;
    }
    setSent(true);
  }

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <BrandMark size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-stone-800">パスワードの再設定</h1>
          <p className="mt-1 text-sm text-stone-500">
            登録メールアドレスに再設定リンクをお送りします
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <MailCheck className="mx-auto h-10 w-10 text-emerald-500" />
            <p className="mt-3 font-bold text-stone-800">メールを送信しました</p>
            <p className="mt-1 text-sm text-stone-500">
              届いたメールのリンクからパスワードを再設定してください。
            </p>
            <Link
              href="/login"
              className="mt-5 inline-block text-sm font-semibold text-amber-600 hover:underline"
            >
              ログインに戻る
            </Link>
          </div>
        ) : (
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
            {error && (
              <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p>
            )}
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "送信中..." : "再設定リンクを送る"}
            </Button>
            <p className="text-center text-sm text-stone-500">
              <Link href="/login" className="font-semibold text-amber-600 hover:underline">
                ログインに戻る
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
