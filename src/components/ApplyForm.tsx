"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";
import { applyToCircle, type ApplyState } from "@/app/actions/applications";
import { Button, Textarea } from "@/components/ui";

export function ApplyForm({ circleId }: { circleId: string }) {
  const [state, formAction, pending] = useActionState<ApplyState, FormData>(
    applyToCircle,
    {},
  );

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="circleId" value={circleId} />
      <Textarea
        name="message"
        required
        minLength={10}
        placeholder="はじめまして！〇〇に興味があり応募しました。週末の活動に参加したいです。"
      />
      {state.error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        <Send className="h-4 w-4" />
        {pending ? "送信中..." : "このサークルに応募する"}
      </Button>
      <p className="text-center text-xs text-stone-400">
        応募すると運営にプロフィールが届き、専用チャットが開きます。
      </p>
    </form>
  );
}
