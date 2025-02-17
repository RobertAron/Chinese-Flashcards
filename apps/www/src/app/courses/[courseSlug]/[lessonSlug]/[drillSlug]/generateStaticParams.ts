import { getDrizzleClient } from "@/utils/getDrizzleClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getDrizzleClient().query.lesson.findMany({
    columns: {
      slug: true,
      courseSlug: true,
    },
    with: {
      drills: {
        columns: {
          slug: true,
        },
      },
    },
  });
  const params = lessons.flatMap((lesson) => [
    {
      courseSlug: lesson.courseSlug,
      lessonSlug: lesson.slug,
      drillSlug: `final-mastery-${lesson.slug}`,
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
