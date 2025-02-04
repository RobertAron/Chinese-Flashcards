import { AppServerLayoutEntrypoint } from "@/components/AppPage";
import { DrillProvider } from "@/components/challenges/ChallengeContext";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { paramsTemplate } from "./page";

export default AppServerLayoutEntrypoint(async function ChallengeLayout({ children, params }) {
  const { drillSlug, courseSlug, lessonSlug } = paramsTemplate.parse(await params);
  const challengeData = await getPrismaClient().drill.findUnique({
    where: { slug: drillSlug },
    include: {
      words: true,
    },
  });

  return (
    <DrillProvider
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      challengeDefinition={{
        id: drillSlug,
        label: challengeData?.title ?? "",
        words:
          challengeData?.words.map((ele) => ({
            character: ele.characters,
            definition: ele.meaning,
            fileName: ele.url,
            id: `word-${ele.id}`,
            pinyin: ele.pinyin,
          })) ?? [],
      }}
    >
      {children}
    </DrillProvider>
  );
});
