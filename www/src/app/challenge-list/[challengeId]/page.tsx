"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/ChallengeContext";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { Link } from "@/components/Link";
import { usePracticeCount, useTimeAttackPB } from "../playerStats";
import { formatMs } from "@/utils/structureUtils";

export default AppPage(() => {
  const { challengeId, challengeItems } = useChallengeContext();
  const [timeAttackPb] = useTimeAttackPB(challengeId);
  const [practiceCount] = usePracticeCount(challengeId);
  return (
    <main className="flex flex-col items-start gap-2 p-1">
      <h1 className="text-3xl font-bold underline">{challengeId}</h1>
      <section className="flex flex-col gap-2 border border-black p-2">
        <h2 className="text-xl font-semibold">Select Mode</h2>
        <Link href={`/challenge-list/${challengeId}/practice`}>
          Practice ({practiceCount})
        </Link>
        <Link href={`/challenge-list/${challengeId}/time-attack`}>
          Time Attack (
          {timeAttackPb === null ? "not completed" : formatMs(timeAttackPb)})
        </Link>
      </section>
      <section className="flex flex-col border border-black p-2">
        <h2 className="text-xl font-semibold">Words</h2>
        {challengeItems.map(({ id, ...rest }) => (
          <PinyinChallenge {...rest} key={id} id={`${id}-display`} display />
        ))}
      </section>
    </main>
  );
});
