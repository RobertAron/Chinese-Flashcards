"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/challenges/ChallengeContext";
import { WordOutline } from "@/components/challenges/WordOutline";
import { Link } from "@/components/Link";
import { formatMs } from "@/utils/structureUtils";
import { match } from "ts-pattern";
import { usePracticeCount, useTimeAttackPB } from "../playerStats";
import { ListChecks, Timer } from "lucide-react";

export default AppPage(() => {
  const { challengeId, wordDefinitions } = useChallengeContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <main className="flex flex-col items-start gap-2 p-1">
      <h1 className="text-3xl font-bold underline">{challengeId}</h1>
      <section className="flex flex-col gap-2 border border-black p-2">
        <h2 className="text-xl font-semibold">Select Mode</h2>
        <Link
          href={`/challenge-list/${challengeId}/practice`}
          className="flex gap-2"
        >
          <span>
            <ListChecks />
          </span>
          Practice ({practiceCount})
        </Link>
        <Link
          href={`/challenge-list/${challengeId}/time-attack`}
          className="flex gap-2"
        >
          <span>
            <Timer />
          </span>
          <span>Time Attack</span>
          {match(timeAttackPb)
            .with(null, () => "Not Completed")
            .otherwise((pb) => (
              <span>
                <span className="font-semibold">PB:</span>
                <span>{formatMs(pb)}</span>
              </span>
            ))}
        </Link>
      </section>
      <section className="flex flex-col gap-2 border border-black p-2">
        <h2 className="text-xl font-semibold">Words</h2>
        {wordDefinitions.map((word) => (
          <WordOutline word={word} key={word.id} />
        ))}
      </section>
    </main>
  );
});
