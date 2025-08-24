import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { LanguagesIcon } from "lucide-react";
import type { Metadata } from "next";
import { Link, LoadingProvider, LoadingRender } from "@/utils/NextNavigationUtils";
import { PlayerProvider, SyncPlayerStateToLocalStorage } from "@/utils/playerState";
import "./globals.css";

export const metadata: Metadata = {
  title: "中文 Flashcards",
  description: "中文 Flashcards",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <PlayerProvider>
      <LoadingProvider>
        <SyncPlayerStateToLocalStorage />
        <html lang="en" className="h-full">
          <body
            className={`${GeistSans.variable} ${GeistMono.variable} relative flex min-h-full flex-col overflow-y-scroll font-sans antialiased`}
          >
            <nav className="relative z-10 flex border-black border-b bg-white">
              <div className="container mx-auto flex gap-2 pt-4 pb-2">
                <Link href="/" className="flex items-center gap-2 hocus:bg-black p-1 pr-2 hocus:text-white">
                  <LanguagesIcon className="shrink-0" />
                  <span className="font-bold text-xl">Chinese Challenges</span>
                </Link>
              </div>
            </nav>
            <div className="container relative z-10 mx-auto flex h-full w-full grow">{children}</div>
            <LoadingRender />
            <div className="texture" />
          </body>
        </html>
      </LoadingProvider>
    </PlayerProvider>
  );
}
