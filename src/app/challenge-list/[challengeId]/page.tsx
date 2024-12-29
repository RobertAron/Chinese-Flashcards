"use client";
import { AppPage } from "@/components/AppPage";
import { useChallengeContext } from "@/components/ChallengeContext";
import { PinyinChallenge } from "@/components/challenges/PinyinChallenge";
import { Link } from "@/components/Link";

export default AppPage(() => {
  const challenge = useChallengeContext();
  return (
    <main className="flex flex-col items-start gap-2 p-1">
      <h1>{challenge.challengeId}</h1>
      <section className="flex flex-col">
        <h2>Select Mode</h2>
        <Link href={`/challenge-list/${challenge.challengeId}/practice`}>
          Practice
        </Link>
        <Link href={`/challenge-list/${challenge.challengeId}/time-attack`}>
          Time Attack
        </Link>
      </section>
      <section className="flex flex-col">
        <h2>Words</h2>
        {challenge.challengeItems.map(({ id, ...rest }) => (
          <PinyinChallenge {...rest} key={id} id={`${id}-display`} display />
        ))}
      </section>
    </main>
  );
});
