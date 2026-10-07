import { cacheLife } from "next/cache";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { SearchPage } from "./client";

export const ensureStatic = "navigation";

export type Words = Awaited<ReturnType<typeof getWords>>;
async function getWords() {
  "use cache";
  cacheLife("days");
  return getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
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
  return <SearchPage words={getWords()} />;
});
