"use client";

import { useActionState } from "react";
import { Save, CheckCircle2 } from "lucide-react";
import { updateProfile, type ProfileState } from "@/app/actions/profile";
import { Button, Field, Input, Textarea } from "@/components/ui";

export function ProfileForm({
  defaults,
}: {
  defaults: {
    name: string;
    bio: string | null;
    affiliation: string | null;
    location: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState<ProfileState, FormData>(
    updateProfile,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
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
