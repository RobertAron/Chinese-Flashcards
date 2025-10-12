import { getPrismaClient } from "@/utils/getPrismaClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const courses = await getPrismaClient().course.findMany({
    select: {
      slug: true,
    },
  });
  return courses.map((ele) => ({
    courseSlug: ele.slug,
  }));
}
