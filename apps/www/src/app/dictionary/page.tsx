import { Suspense } from "react";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { SearchPage } from "./client";

export type Words = Awaited<ReturnType<typeof getWords>>;
const getWords = () =>
  getPrismaClient().words.findMany({
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

async function DictionaryLoader() {
  const words = await getWords();
  return <SearchPage words={words} />;
}

export default AppServerPageEntrypoint(() => {
  return (
    <Suspense>
      <DictionaryLoader />
    </Suspense>
  );
});
