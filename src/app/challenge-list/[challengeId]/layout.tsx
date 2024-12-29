import { ChallengeProvider } from "@/components/ChallengeContext";

export default function ChallengeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ChallengeProvider>{children}</ChallengeProvider>;
}
