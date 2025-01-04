import { ChallengeProvider } from "@/components/challenges/ChallengeContext";

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChallengeProvider>{children}</ChallengeProvider>;
}
