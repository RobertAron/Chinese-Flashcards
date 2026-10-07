import { cacheLife } from "next/cache";
import { Suspense } from "react";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { WordExperience } from "@/components/challenges/WordPoints";
import { Skeleton } from "@/components/Skeleton";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { ExperienceBox } from "./client";

export const ensureStatic = "navigation";

async function getWords() {
  "use cache";
  cacheLife("max");
  return getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
    },
    where: {
      hskLevel: "hsk1",
      buildingBlockOnly: false,
    },
    include: {
      canonicalWord: {
        select: {
          id: true,
          characters: true,
          meaning: true,
        },
      },
    },
  });
}

export default AppServerPageEntrypoint(() => {
  return (
    <div className="flex flex-col gap-2 py-2">
      <Suspense fallback={<ExperienceSkeleton />}>
        <ExperienceGrid />
      </Suspense>
    </div>
  );
});

async function ExperienceGrid() {
  const words = await getWords();
  return (
    <>
      <div className="grid grid-cols-24 gap-2">
        {words.map((ele) => (
          <ExperienceBox key={ele.id} wordId={ele.id} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {words.slice(0, 1_000).map((ele) => (
          <WordExperience key={ele.id} {...ele} />
        ))}
      </div>
    </>
  );
}

function ExperienceSkeleton() {
  return (
    <>
      <div className="grid grid-cols-24 gap-2">
        {Array.from({ length: 48 }, (_, i) => (
          <Skeleton className="aspect-square" key={i} />
        ))}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 8 }, (_, i) => (
          <Skeleton className="h-24" key={i} />
        ))}
      </div>
    </>
  );
}
