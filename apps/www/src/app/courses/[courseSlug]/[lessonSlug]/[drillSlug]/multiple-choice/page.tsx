import { MultipleChoiceChallengeProvider } from "@/components/challenges/MultipleChoiceChallengeProvider";
import { Test } from "./client";

export default function Page() {
  return (
    <MultipleChoiceChallengeProvider>
      <main className="py-2">
        <Test />
      </main>
    </MultipleChoiceChallengeProvider>
  );
}
