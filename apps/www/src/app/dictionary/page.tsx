import { cacheLife } from "next/cache";
import { AppServerPageEntrypoint } from "@/components/AppPage";
import { getPrismaClient } from "@/utils/getPrismaClient";
import { SearchPage } from "./client";

export const ensureStatic = "navigation";

export type Words = Awaited<ReturnType<typeof getWords>>;
/** Every word goes to the browser for client-side search, so select only the fields the page shows. */
async function getWords() {
  "use cache";
  cacheLife("max");
  const words = await getPrismaClient().words.findMany({
    orderBy: {
      frequencyRank: "asc",
    },
    select: {
      id: true,
      characters: true,
      pinyin: true,
      meaning: true,
      frequencyRank: true,
      hskLevel: true,
      canonicalWord: {
        select: {
          id: true,
          characters: true,
          meaning: true,
        },
      },
    },
  });
  // Almost no word has a canonical word, so leave the key out rather than send `null` for each one.
  return words.map(
    ({ canonicalWord, ...word }): typeof word & { canonicalWord?: NonNullable<typeof canonicalWord> } =>
      canonicalWord === null ? word : { ...word, canonicalWord },
  );
}

export default AppServerPageEntrypoint(() => {
  return <SearchPage words={getWords()} />;
});
