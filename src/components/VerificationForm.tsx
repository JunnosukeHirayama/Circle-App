"use client";

import { useRef, useState, useTransition } from "react";
import { BadgeCheck, ShieldCheck, Clock, Upload } from "lucide-react";
import { submitVerification } from "@/app/actions/verification";
import { Button } from "@/components/ui";

export function VerificationForm({
  status,
  note,
}: {
  status: string;
  note?: string | null;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  if (status === "VERIFIED") {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-sky-50 px-4 py-3 text-sm text-sky-700">
        <BadgeCheck className="h-5 w-5" />
        本人確認が完了しています。プロフィールに「本人確認済み」バッジが表示されます。
      </div>
    );
  }

  if (status === "PENDING" || done) {
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
        <Clock className="h-5 w-5" />
        審査中です。運営が確認後、本人確認済みになります（通常1〜2営業日）。
      </div>
    );
  }

  function submit() {
    if (!file) {
      setError("本人確認書類の画像を選択してください");
      return;
    }
    setError(null);
    const fd = new FormData();
    fd.set("document", file);
    startTransition(async () => {
      const res = await submitVerification(fd);
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <div className="space-y-3">
      {status === "REJECTED" && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          前回の申請は承認されませんでした{note ? `（理由：${note}）` : ""}。もう一度ご提出ください。
        </p>
      )}
      <p className="flex items-start gap-2 text-sm text-stone-500">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" />
        運転免許証・マイナンバーカード・学生証などの画像を提出してください。書類は運営のみが確認し、
        外部に公開されません。
      </p>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-stone-200 py-4 text-sm font-semibold text-stone-500 transition hover:border-sky-300 hover:text-sky-600"
      >
        <Upload className="h-4 w-4" />
        {file ? file.name : "本人確認書類の画像を選択"}
      </button>

      {error && <p className="text-sm text-rose-500">{error}</p>}

      <Button type="button" onClick={submit} disabled={pending || !file} className="w-full">
        {pending ? "送信中..." : "本人確認を申請する"}
      </Button>
    </div>
  );
}
