"use client";

import { useState, useTransition } from "react";
import { Star, MessageSquareText } from "lucide-react";
import { submitReview } from "@/app/actions/reviews";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { Avatar } from "@/components/ui";
import { cn, timeAgo } from "@/lib/utils";

export type ReviewItem = {
  id: string;
  reviewerName: string;
  reviewerImage: string | null;
  reviewerStatus: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("inline-flex", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn("h-4 w-4", n <= value ? "fill-amber-400 text-amber-400" : "text-stone-300")}
        />
      ))}
    </span>
  );
}

export function CircleReviews({
  circleId,
  reviews,
  canReview,
  myRating,
  myComment,
}: {
  circleId: string;
  reviews: ReviewItem[];
  canReview: boolean;
  myRating?: number;
  myComment?: string;
}) {
  const [rating, setRating] = useState(myRating ?? 0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState(myComment ?? "");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (rating < 1) {
      setError("星を選択してください");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await submitReview({ circleId, rating, comment });
      if (res?.error) {
        setError(res.error);
        return;
      }
      setDone(true);
    });
  }

  return (
    <div className="space-y-4">
      {canReview && (
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-sm font-semibold text-stone-700">
            {myRating ? "あなたの口コミを更新" : "このサークルを評価する"}
          </p>
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                aria-label={`${n}つ星`}
              >
                <Star
                  className={cn(
                    "h-7 w-7 transition",
                    n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-stone-300",
                  )}
                />
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={500}
            placeholder="活動の雰囲気や参加してよかった点などを書きましょう（任意）"
            className="mt-3 min-h-20 w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm focus:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-200"
          />
          {error && <p className="mt-1 text-sm text-rose-500">{error}</p>}
          {done && <p className="mt-1 text-sm text-emerald-600">口コミを投稿しました ✓</p>}
          <button
            type="button"
            onClick={submit}
            disabled={pending}
            className="mt-2 rounded-full bg-amber-400 px-5 py-2.5 text-sm font-bold text-amber-950 transition hover:bg-amber-300 disabled:opacity-50"
          >
            {pending ? "投稿中..." : "投稿する"}
          </button>
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="flex items-center gap-2 py-2 text-sm text-stone-400">
          <MessageSquareText className="h-4 w-4" />
          まだ口コミはありません。
        </p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="border-t border-stone-100 pt-3 first:border-0 first:pt-0">
              <div className="flex items-center gap-2">
                <Avatar name={r.reviewerName} image={r.reviewerImage} size={32} />
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-stone-800">
                    {r.reviewerName}
                    <VerifiedBadge status={r.reviewerStatus} withLabel={false} />
                  </p>
                  <Stars value={r.rating} />
                </div>
                <span className="ml-auto text-xs text-stone-400">{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-stone-600">{r.comment}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
