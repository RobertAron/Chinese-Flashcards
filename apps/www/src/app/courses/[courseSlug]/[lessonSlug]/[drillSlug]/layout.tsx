import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { DrillProvider } from "@/components/challenges/ChallengeContext";
import { getDrillInfo } from "@/components/challenges/challengeServerUtils";
import { paramsTemplate } from "./paramsTemplate";

type CharacterChallenge = {
  type: "character-challenge";
  id: string;
  characters: string;
  pinyin: string;
};
type AudioChallenge = {
  type: "audio-challenge";
  id: string;
  pinyin: string;
  src: string;
};
type DefinitionChallenge = {
  type: "definition-challenge";
  id: string;
  pinyin: string;
  definition: string;
};
export type AllChallenges = CharacterChallenge | AudioChallenge | DefinitionChallenge;

export default AppServerLayoutEntrypoint(async function ChallengeLayout({ children, params }) {
  const parsedParams = paramsTemplate.parse(await params);
  const challengeData = await getDrillInfo(parsedParams);
  return (
    <DrillProvider {...parsedParams} {...challengeData}>
      {children}
    </DrillProvider>
  );
});
