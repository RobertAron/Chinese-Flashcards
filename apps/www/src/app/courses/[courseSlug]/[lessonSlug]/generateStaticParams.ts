import type { ParamsShape } from "./paramsTemplate";
import { getDrizzleClient } from "@/utils/getDrizzleClient";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getDrizzleClient().query.lesson.findMany({
    columns: {
      slug: true,
      courseSlug: true,
    },
  });
  return lessons.map((ele) => ({
    courseSlug: ele.courseSlug,
    lessonSlug: ele.slug,
  }));
}
