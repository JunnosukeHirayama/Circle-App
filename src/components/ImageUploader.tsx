"use client";

import { useRef, useState } from "react";
import { ImagePlus, X, Star, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX = 5;

export function ImageUploader({ defaultImages = [] }: { defaultImages?: string[] }) {
  const [images, setImages] = useState<string[]>(defaultImages.slice(0, MAX));
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const remaining = MAX - images.length;

  async function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (e.target) e.target.value = ""; // allow re-selecting the same file
    if (files.length === 0) return;

    setError(null);
    if (files.length > remaining) {
      setError(`あと${remaining}枚までアップロードできます`);
      return;
    }

    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "アップロードに失敗しました");
        return;
      }
      setImages((prev) => [...prev, ...data.urls].slice(0, MAX));
    } catch {
      setError("アップロードに失敗しました");
    } finally {
      setUploading(false);
    }
  }

  function remove(url: string) {
    setImages((prev) => prev.filter((u) => u !== url));
  }

  function makeMain(url: string) {
    setImages((prev) => [url, ...prev.filter((u) => u !== url)]);
  }

  return (
    <div>
      {/* Serialized value submitted with the form */}
      <input type="hidden" name="images" value={images.join(",")} />

      <p className="mb-1.5 block text-sm font-semibold text-stone-700">
        サークルの写真（最大{MAX}枚）
      </p>
      <p className="mb-3 text-xs text-stone-400">
        1枚目が一覧やトップに表示されるメイン画像になります。
      </p>

      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div
            key={url}
            className={cn(
              "group relative h-24 w-24 overflow-hidden rounded-2xl ring-2",
              i === 0 ? "ring-amber-400" : "ring-stone-100",
            )}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="h-full w-full object-cover" />

            {i === 0 ? (
              <span className="absolute left-1 top-1 flex items-center gap-0.5 rounded-full bg-amber-400 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                <Star className="h-2.5 w-2.5 fill-current" />
                メイン
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeMain(url)}
                className="absolute inset-x-1 bottom-1 rounded-full bg-white/90 py-1 text-[10px] font-semibold text-stone-700 opacity-0 transition group-hover:opacity-100"
              >
                メインにする
              </button>
            )}

            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-stone-900/60 text-white transition hover:bg-rose-500"
              aria-label="削除"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {images.length < MAX && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="grid h-24 w-24 place-items-center rounded-2xl border-2 border-dashed border-stone-200 text-stone-400 transition hover:border-amber-300 hover:text-amber-500 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <span className="flex flex-col items-center gap-1">
                <ImagePlus className="h-6 w-6" />
                <span className="text-[10px] font-semibold">追加</span>
              </span>
            )}
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        hidden
        onChange={onSelect}
      />

      {error && <p className="mt-2 text-xs text-rose-500">{error}</p>}
    </div>
  );
}
