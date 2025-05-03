import { Link, LoadingProvider, LoadingRender } from "@/utils/NextNavigationUtils";
import { PlayerProvider, SyncPlayerStateToLocalStorage } from "@/utils/playerState";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { LanguagesIcon } from "lucide-react";
import type { Metadata } from "next";
import "./globals.css";

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
    <PlayerProvider>
      <LoadingProvider>
        <SyncPlayerStateToLocalStorage />
        <html lang="en" className="h-full">
          <body
            className={`${GeistSans.variable} ${GeistMono.variable} relative min-h-full overflow-y-scroll pb-8 font-sans antialiased`}
          >
            <div>
              <nav className="relative z-10 flex border-black border-b bg-white">
                <div className="container mx-auto flex gap-2 pt-4 pb-2">
                  <Link href="/" className="flex items-center gap-2 hocus:bg-black p-1 hocus:text-white">
                    <LanguagesIcon className="shrink-0" />
                    <span className="font-bold text-xl">HOME</span>
                  </Link>
                </div>
              </nav>
              <div className="container relative z-10 mx-auto h-full">{children}</div>
            </div>
            <LoadingRender />
            <div className="texture" />
          </body>
        </html>
      </LoadingProvider>
    </PlayerProvider>
  );
}
