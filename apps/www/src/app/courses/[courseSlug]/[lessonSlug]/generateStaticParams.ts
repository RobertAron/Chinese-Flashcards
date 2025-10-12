import { getPrismaClient } from "@/utils/getPrismaClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getPrismaClient().lesson.findMany({
    select: {
      slug: true,
      courseSlug: true,
    },
  });
  return lessons.map((ele) => ({
    courseSlug: ele.courseSlug,
    lessonSlug: ele.slug,
  }));
}
