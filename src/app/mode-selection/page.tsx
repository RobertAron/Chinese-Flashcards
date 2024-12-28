"use client";
import { challenges } from "@/challenges/top100";
import { AppPage } from "@/components/AppPage";
import { Link } from "@/components/Link";
import { useSearchParams } from "next/navigation";

export default AppPage(({}) => {
  return (
    <div>
      <ChallengeList />
    </div>
  );
});

function useChallengeId() {
  const challengeId = useSearchParams().get("challenge-id");
  if (challengeId === null) return null;
  const content = challenges[challengeId];
  if (content === undefined) return null;
  return {
    challengeId,
    content,
  };
}

function ChallengeList() {
  const challenge = useChallengeId();
  if (challenge === null) throw new Error("Not found challenge");
  return (
    <main className="flex flex-col items-start gap-2 p-1">
      <h1>Select Mode</h1>
      <Link href={`/practice?challenge-id=${challenge.challengeId}`}>
        Practice
      </Link>
      <Link href={`/time-attack?challenge-id=${challenge.challengeId}`}>
        Time Attack
      </Link>
    </main>
  );
}
