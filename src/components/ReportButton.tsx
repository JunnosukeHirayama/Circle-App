"use client";

import { useState, useTransition } from "react";
import { Flag, X, CheckCircle2 } from "lucide-react";
import { submitReport } from "@/app/actions/reports";
import { REPORT_REASONS } from "@/lib/constants";
import { Select, Textarea, Button } from "@/components/ui";
import { cn } from "@/lib/utils";

export function ReportButton({
  targetType,
  targetId,
  label = "通報する",
  className,
}: {
  targetType: "CIRCLE" | "USER";
  targetId: string;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function send() {
    setError(null);
    startTransition(async () => {
      const res = await submitReport({ targetType, targetId, reason, detail });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setDone(false);
        }}
        className={cn(
          "inline-flex items-center gap-1.5 text-sm font-semibold text-stone-400 transition hover:text-rose-500",
          className,
        )}
      >
        <Flag className="h-4 w-4" />
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-sm animate-float-in rounded-4xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <Flag className="h-4 w-4" />
                </span>
                通報する
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {done ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
                <p className="mt-3 font-bold text-stone-800">通報を受け付けました</p>
                <p className="mt-1 text-sm text-stone-500">
                  ご報告ありがとうございます。運営で内容を確認します。
                </p>
                <Button onClick={() => setOpen(false)} className="mt-5 w-full">
                  閉じる
                </Button>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">理由</label>
                  <Select value={reason} onChange={(e) => setReason(e.target.value)}>
                    {REPORT_REASONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-stone-700">
                    詳細（任意）
                  </label>
                  <Textarea
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    maxLength={1000}
                    placeholder="状況を具体的に教えてください。"
                  />
                </div>
                {error && <p className="text-sm text-rose-500">{error}</p>}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="h-11 flex-1 rounded-full border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={send}
                    disabled={pending}
                    className="h-11 flex-1 rounded-full bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
                  >
                    {pending ? "送信中..." : "通報する"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
