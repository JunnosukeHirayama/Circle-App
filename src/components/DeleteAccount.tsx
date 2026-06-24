"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { deleteAccount } from "@/app/actions/profile";
import { authClient } from "@/lib/auth-client";

export function DeleteAccount() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onDelete() {
    setError(null);
    startTransition(async () => {
      const res = await deleteAccount();
      if (res?.error) {
        setError(res.error);
        return;
      }
      await authClient.signOut().catch(() => {});
      router.push("/");
      router.refresh();
    });
  }

  return (
    <div className="rounded-4xl border border-rose-100 bg-rose-50/50 p-6">
      <h2 className="font-bold text-rose-700">アカウントの削除</h2>
      <p className="mt-1 text-sm text-stone-500">
        アカウントを削除すると、プロフィール・サークル・応募・チャットなどすべてのデータが
        完全に削除されます。元に戻せません。
      </p>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setConfirmText("");
          setError(null);
        }}
        className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-rose-600 ring-1 ring-rose-200 transition hover:bg-rose-50"
      >
        <Trash2 className="h-4 w-4" />
        アカウントを削除する
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-sm animate-float-in rounded-4xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <h3 className="flex items-center gap-2 text-lg font-extrabold text-stone-800">
                <span className="grid h-9 w-9 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <Trash2 className="h-4 w-4" />
                </span>
                本当に削除しますか？
              </h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm text-stone-600">
              確認のため <span className="font-bold text-rose-600">削除する</span> と入力してください。
            </p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="削除する"
              className="mt-3 w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            {error && <p className="mt-2 text-sm text-rose-500">{error}</p>}
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="h-11 flex-1 rounded-full border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={onDelete}
                disabled={pending || confirmText !== "削除する"}
                className="h-11 flex-1 rounded-full bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
              >
                {pending ? "削除中..." : "完全に削除する"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
