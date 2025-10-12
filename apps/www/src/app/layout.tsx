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
            <nav className="relative z-10 flex bg-white border-b border-black">
              <div className="container flex mx-auto gap-2 justify-between items-center text-black">
                <Link href="/" className="flex items-center py-2 gap-2 hocus:bg-black hocus:text-white">
                  <LanguagesIcon className="shrink-0" />
                  <span className="text-xl font-bold">Chinese Challenges</span>
                </Link>
                <Link
                  href="/user"
                  className="flex items-center py-2 gap-2 hocus:bg-black hocus:text-white rounded-full w-10 h-10"
                >
                  <CircleUserRoundIcon className="shrink-0 w-full h-full" />
                </Link>
              </div>
            </nav>
            <div className="container relative z-10 flex w-full h-full mx-auto grow">{children}</div>
            <LoadingRender />
            <div className="texture" />
          </body>
        </html>
      </LoadingProvider>
    </PlayerProvider>
  );
}
