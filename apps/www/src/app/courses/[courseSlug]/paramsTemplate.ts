import { z } from "zod";

export const paramsTemplate = z.object({
  courseSlug: z.string(),
});
export type ParamsShape = z.infer<typeof paramsTemplate>;
