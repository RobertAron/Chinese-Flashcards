import { TypingChallengeProvider } from "@/components/challenges/TypingChallengeProvider";
import { generateStaticParams } from "../generateStaticParams";
import Practice from "./client";
export { generateStaticParams };

export default function Page() {
  return (
    <TypingChallengeProvider>
      <main className="py-2">
        <Practice />
      </main>
    </TypingChallengeProvider>
  );
}
