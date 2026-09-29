import { TypingChallengeProvider } from "@/components/challenges/TypingChallengeProvider";
import { DailyPractice } from "./client";

export default function Page() {
  return (
    <TypingChallengeProvider>
      <main className="py-2">
        <DailyPractice />
      </main>
    </TypingChallengeProvider>
  );
}
