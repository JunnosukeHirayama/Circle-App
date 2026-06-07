"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CircleGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return null;

  return (
    <div>
      <div className="relative h-56 overflow-hidden rounded-4xl bg-stone-100 sm:h-80">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={name} className="h-full w-full object-cover" />
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={cn(
                "h-16 w-16 shrink-0 overflow-hidden rounded-2xl ring-2 transition",
                i === active ? "ring-amber-400" : "ring-transparent opacity-70 hover:opacity-100",
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
