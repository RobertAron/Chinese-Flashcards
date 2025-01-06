import { wordDefinitions } from "@/challenges/top100";
import { Link } from "@/components/Link";
import { PracticeCountCell, TimeAttackCell } from "./client";

export default function Home() {
  return (
    <main className="flex flex-col p-2">
      <h1 className="text-4xl">Challenge List</h1>
      <div className="grid grid-cols-3">
        <div className="col-span-3 grid grid-cols-subgrid">
          <div>Challenge</div>
          <div className="text-end">Practice</div>
          <div className="text-end">Speedrun</div>
        </div>
        {Object.keys(wordDefinitions).map((ele) => (
          <Link
            className="col-span-3 grid grid-cols-subgrid"
            href={`/challenge-list/${ele}`}
            key={ele}
          >
            <div>{ele}</div>
            <PracticeCountCell challengeId={ele} />
            <TimeAttackCell challengeId={ele} />
          </Link>
        ))}
      </div>
    </main>
  );
}
