"use client";

import { useState } from "react";
import { MailWarning } from "lucide-react";
import { useSession, authClient } from "@/lib/auth-client";

export function VerifyBanner() {
  const { data } = useSession();
  const user = data?.user as { email?: string; emailVerified?: boolean } | undefined;
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!user || user.emailVerified) return null;

  async function resend() {
    if (!user?.email) return;
    setSending(true);
    await authClient.sendVerificationEmail({ email: user.email, callbackURL: "/" });
    setSending(false);
    setSent(true);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-amber-100 px-4 py-2 text-center text-sm text-amber-800">
      <span className="flex items-center gap-1.5">
        <MailWarning className="h-4 w-4" />
        メールアドレスが未確認です。確認するとサークルへの応募・掲載の公開ができます。
      </span>
      {sent ? (
        <span className="font-semibold">確認メールを再送しました ✓</span>
      ) : (
        <button
          onClick={resend}
          disabled={sending}
          className="font-bold underline underline-offset-2 hover:text-amber-900 disabled:opacity-50"
        >
          {sending ? "送信中..." : "確認メールを再送する"}
        </button>
      )}
    </div>
  );
}
