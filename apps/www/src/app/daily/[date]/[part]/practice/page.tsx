import { Suspense } from "react";
import { Skeleton } from "vocab-ui/Skeleton";
import { TypingChallengeProvider } from "@/components/challenges/TypingChallengeProvider";
import { DailyPractice } from "./client";

export default function Page() {
  return (
    <TypingChallengeProvider>
      <main className="py-2">
        {/* DailyPractice reads useParams(), which is only known at runtime. The layout's boundary is
            already resolved when navigating here from the part page, so this page needs its own. */}
        <Suspense fallback={<Skeleton className="mx-auto h-64 w-full lg:max-w-2xl" />}>
          <DailyPractice />
        </Suspense>
      </main>
    </TypingChallengeProvider>
  );
}
