"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button, Field, Input } from "@/components/ui";
import { BrandMark } from "@/components/Logo";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="bg-warm min-h-[calc(100vh-4rem)]" />}>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const invalid = !token || params.get("error") === "INVALID_TOKEN";

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("パスワードは8文字以上で設定してください");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (error) {
      setError(error.message || "再設定に失敗しました。リンクの有効期限が切れている可能性があります。");
      return;
    }
    router.push("/login");
  }

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-float-in rounded-4xl border border-stone-100 bg-white p-8 shadow-sm sm:p-10">
        <div className="mb-6 text-center">
          <BrandMark size={48} className="mx-auto mb-3" />
          <h1 className="text-2xl font-extrabold text-stone-800">新しいパスワード</h1>
          <p className="mt-1 text-sm text-stone-500">新しいパスワードを設定してください</p>
        </div>

        {invalid ? (
          <div className="text-center text-sm text-stone-500">
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-rose-600">
              リンクが無効または期限切れです。
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 inline-block font-semibold text-amber-600 hover:underline"
            >
              もう一度送信する
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="新しいパスワード" htmlFor="password" hint="8文字以上">
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
              {loading ? "更新中..." : "パスワードを更新する"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
