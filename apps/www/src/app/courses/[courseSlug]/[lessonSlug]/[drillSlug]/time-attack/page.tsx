import { TypingChallengeProvider } from "@/components/challenges/TypingChallengeProvider";
import { generateStaticParams } from "../generateStaticParams";
import { TimeAttack } from "./client";
export { generateStaticParams };

export const revalidate = 86400;
export default function Page() {
  return (
    <TypingChallengeProvider>
      <main className="py-2">
        <TimeAttack />
      </main>
    </TypingChallengeProvider>
  );
}
