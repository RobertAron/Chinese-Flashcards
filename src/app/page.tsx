import { challenges } from "@/challenges/top100";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col p-2">
      <h1 className="text-4xl">Root</h1>
      <div className="flex flex-col items-start gap-2">
        {Object.keys(challenges).map((ele) => (
          <Link
            className="hocus:bg-slate-100 rounded-sm border border-black p-1 font-mono"
            href={`/mode-selection?challenge-id=${ele}`}
            key={ele}
          >
            {ele}
          </Link>
        ))}
      </div>
    </main>
  );
}
