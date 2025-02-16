import { getPrismaClient } from "@/utils/getPrismaClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getPrismaClient().lesson.findMany({
    select: {
      slug: true,
      courseSlug: true,
      drills: {
        select: {
          slug: true,
        },
      },
    },
  });
  const params = lessons.flatMap((lesson) => [
    {
      courseSlug: lesson.courseSlug,
      lessonSlug: lesson.slug,
      drillSlug: "final-mastery",
    },
    ...lesson.drills.map(
      (drill): ParamsShape => ({
        courseSlug: lesson.courseSlug,
        lessonSlug: lesson.slug,
        drillSlug: drill.slug,
      }),
    ),
  ]);
  return [...params];
}
