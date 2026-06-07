"use client";

import { useActionState, useState } from "react";
import { Save } from "lucide-react";
import type { CircleFormState } from "@/app/actions/circles";
import {
  CATEGORIES,
  COVER_COLOR_KEYS,
  COVER_COLORS,
  AUDIENCES,
  type CoverColor,
  type AudienceValue,
} from "@/lib/constants";
import { Button, Field, Input, Select, Textarea } from "@/components/ui";
import { ImageUploader } from "@/components/ImageUploader";
import { cn } from "@/lib/utils";

export type CircleDefaults = {
  name?: string;
  description?: string;
  rules?: string | null;
  category?: string;
  location?: string | null;
  capacity?: number | null;
  coverColor?: string;
  tags?: string[];
  images?: string[];
  audience?: string;
};

export function CircleForm({
  action,
  defaults,
  submitLabel = "サークルを公開する",
}: {
  action: (prev: CircleFormState, formData: FormData) => Promise<CircleFormState>;
  defaults?: CircleDefaults;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState<CircleFormState, FormData>(
    action,
    {},
  );
  const [color, setColor] = useState<CoverColor>(
    (defaults?.coverColor as CoverColor) ?? "amber",
  );
  const [audience, setAudience] = useState<AudienceValue>(
    (defaults?.audience as AudienceValue) ?? "BOTH",
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="coverColor" value={color} />
      <input type="hidden" name="audience" value={audience} />

      <Field label="サークル名" htmlFor="name">
        <Input
          id="name"
          name="name"
          required
          maxLength={60}
          defaultValue={defaults?.name}
          placeholder="例：週末フットサルクラブ"
        />
      </Field>

      <Field label="カテゴリ" htmlFor="category">
        <Select id="category" name="category" defaultValue={defaults?.category ?? ""} required>
          <option value="" disabled>
            選択してください
          </option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <div>
        <p className="mb-1.5 block text-sm font-semibold text-stone-700">対象者</p>
        <div className="grid grid-cols-3 gap-2">
          {AUDIENCES.map((a) => (
            <button
              type="button"
              key={a.value}
              onClick={() => setAudience(a.value)}
              className={cn(
                "flex flex-col items-center gap-1 rounded-2xl border-2 px-2 py-3 text-center text-sm font-semibold transition",
                audience === a.value
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-stone-200 text-stone-500 hover:border-amber-200",
              )}
            >
              <span className="text-xl">{a.icon}</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>

      <Field label="活動内容" htmlFor="description" hint="活動の頻度・場所・雰囲気などを書きましょう">
        <Textarea
          id="description"
          name="description"
          required
          minLength={10}
          defaultValue={defaults?.description}
          placeholder="毎週土曜の午前に、初心者中心でゆるくフットサルをしています。運動不足解消したい方、大歓迎です！"
          className="min-h-36"
        />
      </Field>

      <Field label="ルール・お約束（任意）" htmlFor="rules">
        <Textarea
          id="rules"
          name="rules"
          defaultValue={defaults?.rules ?? ""}
          placeholder="・遅刻するときは連絡を&#10;・お酒の強要はなし&#10;・みんなで楽しく！"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="活動エリア（任意）" htmlFor="location">
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="例：東京・渋谷"
          />
        </Field>
        <Field label="募集人数の上限（任意）" htmlFor="capacity">
          <Input
            id="capacity"
            name="capacity"
            type="number"
            min={1}
            defaultValue={defaults?.capacity ?? undefined}
            placeholder="例：20"
          />
        </Field>
      </div>

      <Field label="タグ（任意）" htmlFor="tags" hint="スペースやカンマ区切りで入力（最大8個）">
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(" ")}
          placeholder="初心者歓迎 社会人 週末"
        />
      </Field>

      <ImageUploader defaultImages={defaults?.images ?? []} />

      <div>
        <p className="mb-1.5 block text-sm font-semibold text-stone-700">
          カードの色（画像が無いときに使われます）
        </p>
        <div className="flex flex-wrap gap-2">
          {COVER_COLOR_KEYS.map((key) => (
            <button
              type="button"
              key={key}
              onClick={() => setColor(key)}
              aria-label={key}
              className={cn(
                "h-10 w-10 rounded-2xl ring-2 ring-offset-2 transition",
                COVER_COLORS[key].solid,
                color === key ? "ring-stone-700 scale-110" : "ring-transparent",
              )}
            />
          ))}
        </div>
      </div>

      {state.error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{state.error}</p>
      )}

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <Save className="h-4 w-4" />
        {pending ? "保存中..." : submitLabel}
      </Button>
    </form>
  );
}
