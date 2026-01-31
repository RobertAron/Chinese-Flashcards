import type { InputParamsShape } from "./paramsTemplate";

// Return empty array to use on-demand ISR instead of pre-rendering all pages at build time.
// Pages will be generated on first request and cached according to `revalidate` in page.tsx.
export async function generateStaticParams(): Promise<InputParamsShape[]> {
  //   const words = await getPrismaClient().words.findMany({
  //   select: {
  //     id: true,
  //   },
  // });
  // return words.map((ele) => ({
  //   wordId: `${ele.id}`,
  // }));
  return [];
}
