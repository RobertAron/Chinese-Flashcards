import { allChallenges } from "@/challenges/allChallenges";
import { Link } from "@/components/Link";
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
        {Object.entries(allChallenges).map(([ele, data]) => (
          <Link
            whileHover={{ scale: 1.05 }}
            whileFocus={{ scale: 1.05 }}
            transition={{ duration: 0.1 }}
            className="col-span-3 grid grid-cols-subgrid bg-white"
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
