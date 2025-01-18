import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "../Button";
import { Link } from "../Link";
import { useChallengeContext } from "./ChallengeContext";
import { useUserSettings } from "../useUserSettings";
import { Checkbox } from "../Checkbox";
import { ExitLink } from "@/app/challenge-list/[challengeId]/ExitButton";

export function ChallengeTitle({
  children,
  onStart,
  improve: again,
}: {
  onStart: () => void;
  children?: React.ReactNode;
  improve?: boolean;
}) {
  const [userSettings, setUserSettings] = useUserSettings();
  const { challengeId, challengeLabel } = useChallengeContext();
  return (
    <div className="mx-auto flex w-[32rem] flex-col gap-1">
      <h1 className="rounded-t-md bg-black p-2 text-4xl font-extrabold text-white">
        {challengeLabel}
      </h1>
      <div className="border border-black bg-white p-1">
        <div>{children}</div>
      </div>
      <div className="flex flex-col items-start gap-2 border border-black bg-white p-1">
        <Checkbox
          isSelected={userSettings.enableCharacterChallenges}
          onChange={(selected) => {
            setUserSettings({
              ...userSettings,
              enableCharacterChallenges: selected,
            });
          }}
        >
          Enable Character Challenges
        </Checkbox>
        <Checkbox
          isSelected={userSettings.requireToneInput}
          onChange={(selected) => {
            setUserSettings({
              ...userSettings,
              requireToneInput: selected,
            });
          }}
        >
          Require Tone Inputs
        </Checkbox>
      </div>
      <div className="flex gap-1 border-black">
        <ExitLink
          className="flex w-0 min-w-max items-center justify-center gap-2 rounded-none rounded-bl-md bg-white px-4 py-2"
          href={`/challenge-list/${challengeId}`}
        />
        <Button
          className="flex grow basis-0 items-center justify-center gap-1 rounded-br-md bg-white px-4 py-2"
          onClick={onStart}
          autoFocus
        >
          <span>{again ? "Improve" : "Start"}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
