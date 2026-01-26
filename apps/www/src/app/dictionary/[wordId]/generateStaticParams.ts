import { getPrismaClient } from "@/utils/getPrismaClient";
import type { ParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<ParamsShape[]> {
  const words = await getPrismaClient().words.findMany({
    select: {
      id: true,
    },
  });
  return words.map((ele) => ({
    wordId: `${ele.id}`,
  }));
}
