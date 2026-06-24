import { Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="bg-warm flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-3xl bg-amber-100 text-amber-500">
        <Compass className="h-8 w-8" />
      </span>
      <p className="mt-6 text-6xl font-extrabold text-amber-400">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-stone-800">ページが見つかりません</h1>
      <p className="mt-2 max-w-sm text-sm text-stone-500">
        お探しのページは移動または削除された可能性があります。URLをご確認ください。
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">ホームへ戻る</ButtonLink>
        <ButtonLink href="/circles" variant="secondary">
          サークルを探す
        </ButtonLink>
      </div>
    </div>
  );
}
