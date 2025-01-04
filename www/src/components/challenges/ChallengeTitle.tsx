import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";
import { Link } from "../Link";
import { useChallengeContext } from "./ChallengeContext";

export function ChallengeTitle({
  children,
  onStart,
  improve: again,
}: {
  onStart: () => void;
  children?: React.ReactNode;
  improve?: boolean;
}) {
  const { challengeId } = useChallengeContext();
  return (
    <div className="mx-auto flex max-w-96 flex-col gap-1">
      <h1 className="rounded-t-md bg-black p-2 text-4xl font-extrabold text-white">
        {challengeId}
      </h1>
      <div className="border border-black p-1">
        <div>{children}</div>
      </div>
      <div className="flex gap-1 border-black">
        <Link
          className="flex grow basis-0 items-center justify-center gap-2 rounded-bl-md"
          href={`/challenge-list/${challengeId}`}
        >
          <ChevronLeft />
          <span>Back to types</span>
        </Link>
        <Button
          className="flex grow basis-0 justify-center gap-1 rounded-br-md"
          onClick={onStart}
        >
          <span>{again ? "Start" : "Improve"}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
