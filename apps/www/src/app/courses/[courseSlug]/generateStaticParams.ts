import { getDrizzleClient } from "@/utils/getDrizzleClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const courses = await getDrizzleClient().query.course.findMany({
    columns: {
      slug: true,
    },
  });
  return courses.map((ele) => ({
    courseSlug: ele.slug,
  }));
}
