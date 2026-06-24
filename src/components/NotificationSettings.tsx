"use client";

import { useState, useTransition } from "react";
import { Bell } from "lucide-react";
import { updateNotificationSettings } from "@/app/actions/profile";
import { cn } from "@/lib/utils";

export function NotificationSettings({ defaultOn }: { defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  const [, startTransition] = useTransition();

  function toggle() {
    const next = !on;
    setOn(next);
    startTransition(async () => {
      await updateNotificationSettings(next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left transition hover:bg-amber-50/50"
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
            応募者から新しいメッセージが届いたらメールでお知らせ
          </span>
        </span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition",
          on ? "bg-amber-400" : "bg-stone-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            on ? "left-[22px]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
