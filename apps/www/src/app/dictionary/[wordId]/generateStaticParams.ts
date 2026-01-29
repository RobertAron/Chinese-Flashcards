import { getPrismaClient } from "@/utils/getPrismaClient";
import type { InputParamsShape } from "./paramsTemplate";

export async function generateStaticParams(): Promise<InputParamsShape[]> {
  const words = await getPrismaClient().words.findMany({
    select: {
      id: true,
    },
  });
  return words.map((ele) => ({
    wordId: `${ele.id}`,
  }));
}
