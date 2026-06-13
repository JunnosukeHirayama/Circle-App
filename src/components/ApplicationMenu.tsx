"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { MoreVertical, Ban, X } from "lucide-react";
import { blockUser } from "@/app/actions/blocks";

export function ApplicationMenu({
  blockedUserId,
  applicantName,
}: {
  blockedUserId: string;
  applicantName: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function confirmBlock() {
    startTransition(async () => {
      await blockUser(blockedUserId);
      setModalOpen(false);
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
        aria-label="メニュー"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-10 z-20 w-52 overflow-hidden rounded-2xl border border-stone-100 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false);
              setModalOpen(true);
            }}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
          >
            <Ban className="h-4 w-4" />
            このユーザーをブロック
          </button>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4">
          <div className="w-full max-w-sm animate-float-in rounded-4xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                  <Ban className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-extrabold text-stone-800">ブロックの確認</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full text-stone-400 hover:bg-stone-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-stone-600">
              <span className="font-bold">{applicantName}</span>
              さんをブロックします。ブロックすると、相手にはあなたのサークルとこのチャットが表示されなくなります。
            </p>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="h-11 flex-1 rounded-full border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmBlock}
                disabled={pending}
                className="h-11 flex-1 rounded-full bg-rose-500 text-sm font-semibold text-white transition hover:bg-rose-400 disabled:opacity-50"
              >
                {pending ? "処理中..." : "ブロックする"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
