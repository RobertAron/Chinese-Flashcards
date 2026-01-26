import * as z from "zod/v4-mini";

export const paramsTemplate = z.object({
  wordId: z.coerce.number(),
});
export type ParamsShape = z.infer<typeof paramsTemplate>;
