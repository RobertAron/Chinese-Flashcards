import { challenges } from "@/challenges/top100";
import { useSearchParams } from "next/navigation";

export function useChallenge() {
  const challengeId = useSearchParams().get("challenge-id");
  if (challengeId === null) return null;
  const content = challenges[challengeId];
  if (content === undefined) return null;
  return {
    challengeId,
    content,
  };
}
