import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "サークルリンク — サークルメンバー募集",
    template: "%s | サークルリンク",
  },
  description:
    "社会人・学生サークルのメンバー募集と参加が、もっと身近に。気になるサークルを見つけて、その場でチャットを始めよう。",
  openGraph: {
    title: "サークルリンク — サークルメンバー募集",
    description:
      "社会人・学生サークルのメンバー募集と参加が、もっと身近に。気になるサークルを見つけて、その場でチャットを始めよう。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-[#fffdf8]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
