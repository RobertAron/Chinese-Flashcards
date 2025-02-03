import { AppServerEntrypoint } from "@/components/AppPage";
import { ChallengeProvider } from "@/components/challenges/ChallengeContext";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { z } from "zod";

export const paramsTemplate = z.object({ drillSlug: z.string(), lessonSlug: z.string(), courseSlug: z.string() });
export default AppServerEntrypoint(async function ChallengeLayout({ children, params }) {
  const { drillSlug, courseSlug, lessonSlug } = paramsTemplate.parse(await params);
  const challengeData = await getPrismaClient().challenge.findUnique({
    where: { slug: drillSlug },
    include: {
      words: true,
    },
  });

  return (
    <ChallengeProvider
      courseSlug={courseSlug}
      lessonSlug={lessonSlug}
      challengeDefinition={{
        id: drillSlug,
        label: challengeData?.title ?? "",
        words:
          challengeData?.words.map((ele) => ({
            character: ele.characters,
            definition: ele.meaning,
            fileName: "",
            id: `word-${ele.id}`,
            pinyin: ele.pinyin,
          })) ?? [],
      }}
    >
      {children}
    </ChallengeProvider>
  );
});
