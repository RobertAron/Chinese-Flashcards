import { getPrismaClient } from "@/utils/getPrismaClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const lessons = await getPrismaClient().course.findMany({
    select: {
      slug: true,
    },
  });
  return lessons.map((ele) => ({
    courseSlug: ele.slug,
  }));
}
