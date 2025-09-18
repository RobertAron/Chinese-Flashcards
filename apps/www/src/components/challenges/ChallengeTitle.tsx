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
    <div className="flex flex-col mx-auto gap-1 lg:max-w-2xl">
      <h1 className="p-3 text-4xl font-extrabold text-white bg-black rounded-t-md">{challengeLabel}</h1>
      <div className="p-2 bg-white border-2 border-black">{children}</div>
      <div className="flex flex-col items-start p-2 bg-white border-2 border-black gap-2">
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
      <div className="flex border-black gap-1">
        <ExitLink
          className={`${buttonBehaviorClasses} flex w-0 min-w-max items-center justify-center gap-2 rounded-none rounded-bl-md bg-white px-4 py-2`}
          href={`/courses/${courseSlug}/${lessonSlug}/${challengeId}`}
        >
          Exit
        </ExitLink>
        <Button
          className="flex items-center justify-center px-4 py-2 text-xl font-bold bg-white grow basis-0 gap-1 rounded-br-md"
          onClick={onStart}
          disabled={disableStart}
        >
          <Kbd>↵</Kbd>
          <span>{again ? "IMPROVE" : "START"}</span>
          <ChevronRight />
        </Button>
      </div>
    </div>
  );
}
