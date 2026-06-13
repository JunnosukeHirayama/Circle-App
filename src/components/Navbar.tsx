"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  LayoutDashboard,
  MessageCircle,
  Menu,
  X,
  LogOut,
  Sparkles,
} from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";
import { Avatar, ButtonLink } from "@/components/ui";
import { cn } from "@/lib/utils";

type NavLink = {
  href: string;
  label: string;
  icon: typeof Compass;
  auth?: boolean;
  organizerOnly?: boolean;
};

const navLinks: NavLink[] = [
  { href: "/circles", label: "サークルを探す", icon: Compass },
  { href: "/dashboard", label: "ダッシュボード", icon: LayoutDashboard, auth: true, organizerOnly: true },
  { href: "/chat", label: "チャット", icon: MessageCircle, auth: true },
];

export function Navbar() {
  const { data: session, isPending } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const user = session?.user;
  const isOrganizer = (user as { role?: string } | undefined)?.role === "ORGANIZER";
  const visibleLinks = navLinks.filter(
    (l) => (!l.auth || user) && (!l.organizerOnly || isOrganizer),
  );

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-amber-100/80 bg-[#fffdf8]/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-stone-800">
          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-amber-400 text-amber-950 shadow-sm shadow-amber-200">
            <Sparkles className="h-5 w-5" />
          </span>
          <span className="text-lg">Circ<span className="text-amber-500">le</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks
            .map((l) => {
              const active = pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-amber-100 text-amber-700"
                      : "text-stone-600 hover:bg-amber-50 hover:text-amber-700",
                  )}
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              );
            })}
        </nav>

        {/* Right side */}
        <div className="hidden items-center gap-3 md:flex">
          {isPending ? (
            <div className="h-9 w-20 animate-pulse rounded-full bg-amber-100" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/me"
                className="flex items-center gap-2 rounded-full p-1 pr-3 transition hover:bg-amber-50"
              >
                <Avatar name={user.name} image={user.image} size={32} />
                <span className="flex flex-col leading-tight">
                  <span className="text-sm font-semibold text-stone-700">{user.name}</span>
                  <span
                    className={cn(
                      "text-[10px] font-bold",
                      isOrganizer ? "text-violet-500" : "text-sky-500",
                    )}
                  >
                    {isOrganizer ? "募集アカウント" : "一般ユーザー"}
                  </span>
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                title="ログアウト"
                className="grid h-9 w-9 place-items-center rounded-full text-stone-400 transition hover:bg-rose-50 hover:text-rose-500"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-semibold text-stone-600 hover:text-amber-700"
              >
                ログイン
              </Link>
              <ButtonLink href="/signup" size="sm">
                はじめる
              </ButtonLink>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="grid h-10 w-10 place-items-center rounded-full text-stone-600 md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="メニュー"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-amber-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {visibleLinks
              .map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-amber-50"
                >
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
            <div className="my-2 h-px bg-amber-100" />
            {user ? (
              <>
                <Link
                  href="/me"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-stone-700 hover:bg-amber-50"
                >
                  <Avatar name={user.name} image={user.image} size={24} />
                  マイページ
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-2xl px-4 py-3 text-left text-sm font-semibold text-rose-500 hover:bg-rose-50"
                >
                  <LogOut className="h-4 w-4" />
                  ログアウト
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-2 pt-1">
                <ButtonLink href="/login" variant="secondary" size="sm" className="flex-1">
                  ログイン
                </ButtonLink>
                <ButtonLink href="/signup" size="sm" className="flex-1">
                  はじめる
                </ButtonLink>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
