import { ChevronRight } from "lucide-react";
import { ExitLink } from "@/app/courses/[courseSlug]/[lessonSlug]/[drillSlug]/ExitButton";
import { useKeyTrigger } from "@/utils/hooks";
import { useUserSettings } from "@/utils/playerState";
import { Button } from "../Button";
import { Checkbox } from "../Checkbox";
import { buttonBehaviorClasses } from "../coreClasses";
import { Kbd } from "../Kbd";
import { useDrillContext } from "./DrillProvider";

export function ChallengeTitle({
  children,
  onStart,
  improve: again,
  disableStart,
}: {
  onStart: () => void;
  children?: React.ReactNode;
  improve?: boolean;
  disableStart?: boolean;
}) {
  const [userSettings, setUserSettings] = useUserSettings();
  const { challengeId, challengeLabel, courseSlug, lessonSlug } = useDrillContext();
  useKeyTrigger("Enter", onStart);
  return (
    <div className="mx-auto flex flex-col gap-1 lg:max-w-2xl">
      <h1 className="rounded-t-md bg-black p-3 font-extrabold text-4xl text-white">{challengeLabel}</h1>
      <div className="border-2 border-black bg-white p-2">{children}</div>
      <div className="flex flex-col items-start gap-2 border-2 border-black bg-white p-2">
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
        <Checkbox
          isSelected={userSettings.enableTypingChallenges}
          onChange={(selected) => {
            setUserSettings({
              ...userSettings,
              enableTypingChallenges: selected,
            });
          }}
        >
          Enable Typing Challenges
        </Checkbox>
        <Checkbox
          isSelected={userSettings.enableMultipleChoiceChallenges}
          onChange={(selected) => {
            setUserSettings({
              ...userSettings,
              enableMultipleChoiceChallenges: selected,
            });
          }}
        >
          Enable Multiple Choice Challenges
        </Checkbox>
      </div>
      <div className="flex gap-1 border-black">
        <ExitLink
          className={`${buttonBehaviorClasses} flex w-0 min-w-max items-center justify-center gap-2 rounded-none rounded-bl-md bg-white px-4 py-2`}
          href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}`}
        >
          Exit
        </ExitLink>
        <Button
          className="flex grow basis-0 items-center justify-center gap-1 rounded-br-md bg-white px-4 py-2 font-bold text-xl"
          onClick={onStart}
          isDisabled={disableStart}
        >
          <Kbd>↵</Kbd>
          <span>{again ? "IMPROVE" : "START"}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
