import { HomeIcon } from "lucide-react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "中国 Flashcards",
  description: "中国 Flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-slate-200">
      <body
        className={`${geistSans.variable} ${geistMono.variable} h-full overflow-y-scroll antialiased`}
      >
        <nav className="flex border-b border-black">
          <div className="container mx-auto flex gap-2">
            <Link href="/" className="flex gap-2 p-1 hocus:bg-slate-300">
              <HomeIcon />
              <span>Home</span>
            </Link>
          </div>
        </nav>
        <div className="container mx-auto h-full">{children}</div>
      </body>
    </html>
  );
}
