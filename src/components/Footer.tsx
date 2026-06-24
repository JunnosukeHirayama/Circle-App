import Link from "next/link";
import { BrandMark } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-amber-100 bg-[#fffdf8]">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex items-center gap-2">
          <BrandMark size={32} />
          <span className="font-extrabold text-stone-800">
            サークル<span className="text-amber-500">リンク</span>
          </span>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-stone-500">
          <Link href="/circles" className="hover:text-amber-600">
            サークルを探す
          </Link>
          <Link href="/terms" className="hover:text-amber-600">
            利用規約
          </Link>
          <Link href="/privacy" className="hover:text-amber-600">
            プライバシーポリシー
          </Link>
          <Link href="/contact" className="hover:text-amber-600">
            お問い合わせ
          </Link>
        </nav>
      </div>
      <div className="border-t border-amber-100/70 py-4 text-center text-xs text-stone-400">
        © 2026 サークルリンク — みんなのサークル募集アプリ
      </div>
    </footer>
  );
}
