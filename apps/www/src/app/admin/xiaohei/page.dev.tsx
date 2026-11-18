import { connection } from "next/server";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { PhraseReview } from "./client";

const getLessons = () =>
  getPrismaClient().lesson.findMany({
    where: { courseSlug: { startsWith: "xiaohei" } },
    orderBy: [{ Course: { ordering: "asc" } }, { ordering: "asc" }],
    select: {
      slug: true,
      title: true,
      Course: { select: { title: true } },
      // Word drills have nothing to review.
      Drill: {
        where: { Phrases: { some: {} } },
        orderBy: { order: "asc" },
        select: {
          slug: true,
          title: true,
          Phrases: {
            orderBy: { id: "asc" },
            select: {
              id: true,
              meaning: true,
              PhraseWords: { orderBy: { order: "asc" }, select: { word: { select: { characters: true } } } },
            },
          },
        },
      },
    },
  });

export type ReviewLessons = Awaited<ReturnType<typeof getLessons>>;

// Dev-only review tool: reads the DB at request time so deletions show up on reload.
export const instant = false;
export default AppServerPageEntrypoint(async () => {
  await connection();
  const lessons = await getLessons();
  return (
    <div className="grid w-full grid-flow-row gap-3 py-4">
      <h1 className="text-5xl font-bold underline">Review Xiaohei phrases</h1>
      <PhraseReview lessons={lessons} />
    </div>
  );
});
