import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { CircleUserRoundIcon, LanguagesIcon } from "lucide-react";
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
              <div className="container mx-auto flex items-center justify-between gap-2 text-black">
                <Link href="/" className="flex items-center gap-2 hocus:bg-black py-2 hocus:text-white">
                  <LanguagesIcon className="shrink-0" />
                  <span className="font-bold text-xl">Chinese Challenges</span>
                </Link>
                <Link
                  href="/user"
                  className="flex h-10 w-10 items-center gap-2 rounded-full hocus:bg-black py-2 hocus:text-white"
                >
                  <CircleUserRoundIcon className="h-full w-full shrink-0" />
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
