import { getDrizzleClient } from "@/utils/getDrizzleClient";
import { notFound } from "next/navigation";
import React from "react";

export const getCourseOutline = React.cache(async (courseSlug: string) => {
  const course = await getDrizzleClient().query.course.findFirst({
    where: (course, { eq }) => eq(course.slug, courseSlug),
    columns: {
      title: true,
      slug: true,
    },
    with: {
      lessons: {
        columns: {
          slug: true,
          title: true,
        },
        with: {
          drills: {
            columns: {
              slug: true,
              title: true,
            },
          },
        },
        orderBy: (t, { asc }) => asc(t.ordering),
      },
    },
  });
  if (course == null) notFound();
  return course;
});
