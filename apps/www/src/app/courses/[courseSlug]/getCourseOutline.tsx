import { notFound } from "next/navigation";
import React from "react";
import { getPrismaClient } from "@/utils/getPrismaClient";

export const getCourseOutline = React.cache(async (courseSlug: string) => {
  const course = await getPrismaClient().course.findFirst({
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
  if (course == null) notFound();
  return course;
});
