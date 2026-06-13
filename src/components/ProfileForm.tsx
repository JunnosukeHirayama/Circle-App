"use client";

import { useActionState, useState } from "react";
import { Save, CheckCircle2, Bell } from "lucide-react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ProfileForm({
  defaults,
}: {
  defaults: {
    name: string;
    bio: string | null;
    affiliation: string | null;
    location: string | null;
    emailNotifications: boolean;
  };
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );
  const [emailOn, setEmailOn] = useState(defaults.emailNotifications);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="emailNotifications" value={emailOn ? "on" : "off"} />

      <Field label="お名前 / ニックネーム" htmlFor="name">
        <Input id="name" name="name" required defaultValue={defaults.name} maxLength={40} />
      </Field>
      <Field label="自己紹介" htmlFor="bio" hint="応募時に運営者へ伝わります">
        <Textarea
          id="bio"
          name="bio"
          defaultValue={defaults.bio ?? ""}
          placeholder="趣味や好きなこと、サークルに求めることなどを書きましょう。"
        />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="所属（大学・会社など）" htmlFor="affiliation">
          <Input
            id="affiliation"
            name="affiliation"
            defaultValue={defaults.affiliation ?? ""}
            placeholder="例：〇〇大学 / 会社員"
          />
        </Field>
        <Field label="活動希望エリア" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={defaults.location ?? ""}
            placeholder="例：東京・神奈川"
          />
        </Field>
      </div>

      {/* メール通知トグル */}
      <button
        type="button"
        onClick={() => setEmailOn((v) => !v)}
        className="flex w-full items-center justify-between rounded-2xl border border-stone-200 px-4 py-3 text-left transition hover:bg-amber-50/50"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-600">
            <Bell className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-stone-700">
              新着メッセージのメール通知
            </span>
            <span className="block text-xs text-stone-400">
              チャットに新しいメッセージが届いたらメールでお知らせ
            </span>
          </span>
        </span>
        <span
          className={cn(
            "relative h-6 w-11 shrink-0 rounded-full transition",
            emailOn ? "bg-amber-400" : "bg-stone-300",
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
              emailOn ? "left-[22px]" : "left-0.5",
            )}
          />
        </span>
      </button>

      {state.error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      )}
      {state.ok && (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
          <CheckCircle2 className="h-4 w-4" />
          プロフィールを保存しました
        </p>
      )}

      <Button type="submit" size="lg" disabled={pending}>
        <Save className="h-4 w-4" />
        {pending ? "保存中..." : "プロフィールを保存"}
      </Button>
    </form>
  );
}
