"use client";

import { useState } from "react";
import {
  CATEGORIES,
  COVER_COLOR_KEYS,
  COVER_COLORS,
  AUDIENCES,
  AREA_SPECIAL,
  PREFECTURES,
  type CoverColor,
  type AudienceValue,
} from "@/lib/constants";
import { Field, Input, Label, Select, Textarea } from "@/components/ui";
import { ImageUploader } from "@/components/ImageUploader";
import { cn } from "@/lib/utils";

export type CircleDefaults = {
  name?: string;
  description?: string;
  rules?: string | null;
  category?: string;
  frequency?: string;
  area?: string;
  location?: string | null;
  capacity?: number | null;
  coverColor?: string;
  tags?: string[];
  images?: string[];
  audience?: string;
  hasFee?: boolean;
  feeText?: string | null;
};

/**
 * All circle input fields (no <form> wrapper). Used by CircleForm and the
 * organizer signup flow. State-backed values (audience, color, fee, publish)
 * are submitted via hidden inputs.
 */
export function CircleFields({
  defaults,
  includeImages = true,
  showPublish = false,
  nameLabel = "サークル名",
}: {
  defaults?: CircleDefaults;
  includeImages?: boolean;
  showPublish?: boolean;
  nameLabel?: string;
}) {
  const [color, setColor] = useState<CoverColor>(
    (defaults?.coverColor as CoverColor) ?? "amber",
  );
  const [audience, setAudience] = useState<AudienceValue>(
    (defaults?.audience as AudienceValue) ?? "BOTH",
  );
  const [hasFee, setHasFee] = useState<boolean>(defaults?.hasFee ?? false);
  const [publish, setPublish] = useState<"open" | "paused">("open");

  return (
    <div className="space-y-5">
      <input type="hidden" name="coverColor" value={color} />
      <input type="hidden" name="audience" value={audience} />
      <input type="hidden" name="hasFee" value={hasFee ? "yes" : "no"} />
      {showPublish && <input type="hidden" name="recruiting" value={publish} />}

      <Field label={nameLabel} htmlFor="name">
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

      <Field label="活動頻度" htmlFor="frequency" hint="例：毎週土曜の午前 / 月1回 / 不定期（必須）">
        <Input
          id="frequency"
          name="frequency"
          required
          maxLength={60}
          defaultValue={defaults?.frequency ?? ""}
          placeholder="例：毎週土曜の午前"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="活動場所" htmlFor="area" hint="検索の絞り込みに使われます（必須）">
          <Select id="area" name="area" defaultValue={defaults?.area ?? ""} required>
            <option value="" disabled>
              選択してください
            </option>
            <optgroup label="エリア区分">
              {AREA_SPECIAL.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </optgroup>
            <optgroup label="都道府県">
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </optgroup>
          </Select>
        </Field>
        <Field label="詳細な場所（任意）" htmlFor="location" hint="市区町村・会場名など">
          <Input
            id="location"
            name="location"
            defaultValue={defaults?.location ?? ""}
            placeholder="例：渋谷区・〇〇体育館"
          />
        </Field>
      </div>

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

      {/* 会費（必須） */}
      <div>
        <p className="mb-1.5 block text-sm font-semibold text-stone-700">
          会費 <span className="text-rose-500">*</span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setHasFee(false)}
            className={cn(
              "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition",
              !hasFee ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-amber-200",
            )}
          >
            会費なし（無料）
          </button>
          <button
            type="button"
            onClick={() => setHasFee(true)}
            className={cn(
              "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition",
              hasFee ? "border-amber-400 bg-amber-50 text-amber-700" : "border-stone-200 text-stone-500 hover:border-amber-200",
            )}
          >
            会費あり
          </button>
        </div>
        {hasFee && (
          <div className="mt-3">
            <Label htmlFor="feeText">会費の内容</Label>
            <Input
              id="feeText"
              name="feeText"
              required
              maxLength={100}
              defaultValue={defaults?.feeText ?? ""}
              placeholder="例：月額500円 / 年額3,000円 / 活動の都度300円"
            />
            <p className="mt-1 text-xs text-stone-400">
              金額だけでなく「月額」「年額」「都度」など自由に書けます。
            </p>
          </div>
        )}
      </div>

      <Field label="タグ（任意）" htmlFor="tags" hint="スペースやカンマ区切りで入力（最大8個）">
        <Input
          id="tags"
          name="tags"
          defaultValue={defaults?.tags?.join(" ")}
          placeholder="初心者歓迎 社会人 週末"
        />
      </Field>

      {includeImages && <ImageUploader defaultImages={defaults?.images ?? []} />}

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

      {/* 公開状態（作成時のみ） */}
      {showPublish && (
        <div>
          <p className="mb-1.5 block text-sm font-semibold text-stone-700">公開設定</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPublish("open")}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition",
                publish === "open"
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-stone-200 text-stone-500 hover:border-amber-200",
              )}
            >
              すぐに公開（募集中）
            </button>
            <button
              type="button"
              onClick={() => setPublish("paused")}
              className={cn(
                "rounded-2xl border-2 px-4 py-3 text-sm font-semibold transition",
                publish === "paused"
                  ? "border-amber-400 bg-amber-50 text-amber-700"
                  : "border-stone-200 text-stone-500 hover:border-amber-200",
              )}
            >
              募集停止中で公開
            </button>
          </div>
          <p className="mt-1 text-xs text-stone-400">
            あとからダッシュボードでいつでも切り替えられます。
          </p>
        </div>
      )}
    </div>
  );
}
