"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCw } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-rose-100 text-rose-500">
        <AlertTriangle className="h-8 w-8" />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold text-stone-800">エラーが発生しました</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        一時的な問題が発生しました。時間をおいて再度お試しください。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>
          <RotateCw className="h-4 w-4" />
          再読み込み
        </Button>
        <ButtonLink href="/" variant="secondary">
          ホームへ戻る
        </ButtonLink>
      </div>
    </div>
  );
}
