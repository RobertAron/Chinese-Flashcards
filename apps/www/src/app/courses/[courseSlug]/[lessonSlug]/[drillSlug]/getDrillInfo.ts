import { getPrismaClient } from "@/utils/getPrismaClient";
import { notFound } from "next/navigation";
import React from "react";
import type { ParamsShape } from "./paramsTemplate";

function pojoIfy<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

function deDupe<T, U>(arr: T[], cb: (ele: T) => U) {
  const soFar = new Set<U>();
  return arr.filter((ele) => {
    const key = cb(ele);
    if (soFar.has(key)) return false;
    soFar.add(key);
    return true;
  });
}

export const getDrillInfo = React.cache(async function c(params: ParamsShape) {
  if (params.drillSlug.startsWith("final-mastery")) {
    const parentLesson = await getPrismaClient().lesson.findUnique({
      where: {
        slug: params.lessonSlug,
      },
      select: {
        title: true,
        course: {
          select: {
            title: true,
          },
        },
        drills: {
          select: {
            words: true,
          },
        },
      },
    });
    if (parentLesson === null) notFound();
    return {
      courseTitle: parentLesson.course.title,
      lessonTitle: parentLesson.title,
      words: deDupe(
        parentLesson.drills.flatMap((drill) => drill.words).map((ele) => pojoIfy(ele)),
        (ele) => ele.id,
      ),
      drillTitle: "Final Mastery",
    };
  }
  const drill = await getPrismaClient().drill.findUnique({
    where: { slug: params.drillSlug },
    select: {
      title: true,
      words: true,
      lesson: {
        select: {
          title: true,
          course: {
            select: {
              title: true,
            },
          },
        },
      },
    },
  });
  if (drill === null) notFound();
  return {
    courseTitle: drill.lesson.course.title,
    lessonTitle: drill.lesson.title,
    drillTitle: drill.title,
    words: deDupe(
      drill.words.map((ele) => pojoIfy(ele)),
      (ele) => ele.id,
    ),
  };
});
