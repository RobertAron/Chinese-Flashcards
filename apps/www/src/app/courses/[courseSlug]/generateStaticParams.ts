import type { ParamsShape } from "./paramsTemplate";
import { getDrizzleClient } from "@/utils/getDrizzleClient";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const courses = await getDrizzleClient().query.course.findMany({
    columns:{
      slug:true
    }
  })
  return courses.map((ele) => ({
    courseSlug: ele.slug,
  }));
}
