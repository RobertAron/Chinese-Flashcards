import { cacheLife } from "next/cache";
import { notFound } from "next/navigation";
import React from "react";
import { getPrismaClient } from "@/utils/getPrismaClient";

async function queryCourseOutline(courseSlug: string) {
  "use cache";
  cacheLife("max");
  return getPrismaClient().course.findFirst({
    where: {
      slug: courseSlug,
    },
    select: {
      title: true,
      slug: true,
      Lesson: {
        orderBy: {
          ordering: "asc",
        },
        select: {
          slug: true,
          title: true,
          Drill: {
            select: {
              slug: true,
              title: true,
            },
          },
        },
      },
    },
  });
}

export const getCourseOutline = React.cache(async (courseSlug: string) => {
  const course = await queryCourseOutline(courseSlug);
  if (course == null) notFound();
  return course;
});
