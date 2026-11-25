import type { Metadata } from "next";
import { cn } from "vocab-ui/cn";
import { buttonBehaviorClasses } from "vocab-ui/coreClasses";
import { Link } from "@/utils/NextNavigationUtils";

export const metadata: Metadata = {
  title: "404: Page not found",
};

// Replaces Next's built-in 404, whose inline <style> turns the body black in dark mode. Cache Components
// keeps visited routes mounted in a hidden <Activity>, so that style kept applying after navigating away.
export default function NotFound() {
  return (
    <main className="flex w-full flex-col items-start gap-6 px-3 py-6">
      <div>
        <p className="font-mono text-sm tracking-widest uppercase">404</p>
        <h1 className="text-5xl font-black">Page not found.</h1>
      </div>
      <Link href="/" className={cn(buttonBehaviorClasses, "rounded-lg px-5 py-3 font-bold")}>
        Back to home
      </Link>
    </main>
  );
}
