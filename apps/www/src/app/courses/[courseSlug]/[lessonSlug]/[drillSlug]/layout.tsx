import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { DrillProvider } from "@/components/challenges/DrillProvider";
import { getDrillInfo } from "@/components/challenges/challengeServerUtils";
import { paramsTemplate } from "./paramsTemplate";

export default AppServerLayoutEntrypoint(async function ChallengeLayout({ children, params }) {
  const parsedParams = paramsTemplate.parse(await params);
  const challengeData = await getDrillInfo(parsedParams);
  return (
    <DrillProvider {...parsedParams} {...challengeData}>
      {children}
    </DrillProvider>
  );
});
