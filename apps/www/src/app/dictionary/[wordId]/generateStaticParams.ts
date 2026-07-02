import { getPrismaClient } from "@/utils/getPrismaClient";
import type { InputParamsShape } from "./paramsTemplate";

// Prerender a single word at build time; the rest are generated on demand and
// cached according to `cacheLife` in page.tsx. Cache Components requires at
// least one result so the route can be validated at build time.
export async function generateStaticParams(): Promise<InputParamsShape[]> {
  const word = await getPrismaClient().words.findFirst({
    orderBy: { frequencyRank: "asc" },
    select: { id: true },
  });
  if (word === null) return [];
  return [{ wordId: `${word.id}` }];
}
