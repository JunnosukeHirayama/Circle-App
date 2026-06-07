import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { coverTheme, audienceMeta } from "@/lib/constants";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/utils";

export type CircleCardData = {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string | null;
  memberCount: number;
  capacity: number | null;
  coverColor: string;
  images: string[];
  tags: string[];
  audience: string;
};

export function CircleCard({ circle }: { circle: CircleCardData }) {
  const theme = coverTheme(circle.coverColor);
  const full = circle.capacity != null && circle.memberCount >= circle.capacity;
  const cover = circle.images?.[0];
  const aud = audienceMeta(circle.audience);

  return (
    <Link
      href={`/circles/${circle.id}`}
      className="group flex flex-col overflow-hidden rounded-4xl border border-stone-100 bg-white shadow-sm shadow-stone-100 transition hover:-translate-y-1 hover:shadow-md hover:shadow-amber-100"
    >
      {/* Cover */}
      <div className={cn("relative h-32 overflow-hidden", theme.bg)}>
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover} alt={circle.name} className="h-full w-full object-cover" />
        ) : (
          <>
            <div className={cn("absolute -right-6 -top-8 h-28 w-28 rounded-full opacity-50", theme.solid)} />
            <div className={cn("absolute right-10 top-10 h-16 w-16 rounded-full opacity-40", theme.solid)} />
          </>
        )}
        <span
          className={cn(
            "absolute left-5 top-5 rounded-full px-3 py-1 text-xs font-bold",
            cover ? "bg-white/90 text-stone-700 shadow-sm" : cn("bg-white/80", theme.text),
          )}
        >
          {circle.category}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold", aud.style)}>
            <span>{aud.icon}</span>
            {aud.label}
          </span>
        </div>
        <h3 className="text-lg font-extrabold leading-snug text-stone-800 group-hover:text-amber-600">
          {circle.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-stone-500">
          {circle.description}
        </p>

        {circle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {circle.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs text-stone-500">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-1 flex items-center justify-between border-t border-stone-100 pt-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {circle.memberCount}
            {circle.capacity != null && ` / ${circle.capacity}`}人
          </span>
          {circle.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {circle.location}
            </span>
          )}
          {full ? (
            <Badge className="bg-stone-100 text-stone-500">満員</Badge>
          ) : (
            <Badge className="bg-emerald-100 text-emerald-600">募集中</Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
