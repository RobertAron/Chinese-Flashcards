import { allChallenges } from "@/challenges/allChallenges";
import { PracticeCountCell, TimeAttackCell } from "./client";
import Link from "next/link";
import {
  buttonBehaviorClasses,
  popOutBehaviorClasses,
} from "@/components/coreClasses";

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
        {Object.entries(allChallenges).map(([ele, data]) => (
          <Link
            className={`${buttonBehaviorClasses} ${popOutBehaviorClasses} col-span-3 grid grid-cols-subgrid`}
            href={`/challenge-list/${ele}`}
            key={ele}
          >
            <div>{data.label}</div>
            <PracticeCountCell challengeId={ele} />
            <TimeAttackCell challengeId={ele} />
          </Link>
        ))}
      </div>
    </main>
  );
}
