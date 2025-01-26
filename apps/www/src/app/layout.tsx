import { LanguagesIcon } from "lucide-react";
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
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} relative min-h-full overflow-y-scroll antialiased`}
      >
        <div>
          <nav className="relative z-10 flex border-b border-black bg-white">
            <div className="container mx-auto flex gap-2">
              <Link href="/" className="flex items-center gap-2 p-1 hocus:bg-black hocus:text-white">
                <LanguagesIcon className="shrink-0" />
                <span className="text-xl font-bold">HOME</span>
              </Link>
            </div>
          </nav>
          <div className="container relative z-10 mx-auto h-full">{children}</div>
        </div>
        <div className="texture" />
      </body>
    </html>
  );
}
