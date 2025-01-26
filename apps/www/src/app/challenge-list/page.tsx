import { allChallenges } from "@/challenges/allChallenges";
import { MotionLink } from "@/components/MotionLink";
import { buttonBehaviorClasses, popOutBehaviorClasses } from "@/components/coreClasses";
import Link from "next/link";
import { PracticeCountCell, TimeAttackCell } from "./client";

export default function Home() {
  return (
    <main className="flex flex-col p-2">
      <h1 className="text-6xl font-black text-blue-700">CHALLENGES</h1>
      <div className="grid grid-cols-3 gap-1">
        <div className="col-span-3 grid grid-cols-subgrid">
          <div>Challenge</div>
          <div className="text-end">Practice</div>
          <div className="text-end">Speedrun</div>
        </div>
        {Object.entries(allChallenges).map(([ele, data], index) => (
          <MotionLink
            initial={{ opacity: 0, scaleY: 1.05 }}
            animate={{ opacity: 1, scaleY: 1 }}
            whileHover={{ scale: 1.1 }}
            whileFocus={{ scale: 1.1 }}
            className={`col-span-3 grid grid-cols-subgrid ${buttonBehaviorClasses}`}
            href={`/challenge-list/${ele}`}
            key={ele}
          >
            <div>{data.label}</div>
            <PracticeCountCell challengeId={ele} />
            <TimeAttackCell challengeId={ele} />
          </MotionLink>
        ))}
      </div>
    </main>
  );
}
