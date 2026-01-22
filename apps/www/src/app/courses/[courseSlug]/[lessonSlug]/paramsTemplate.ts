import { z } from "zod/v4-mini";

export const paramsTemplate = z.object({
  lessonSlug: z.string(),
  courseSlug: z.string(),
});
export type ParamsShape = z.infer<typeof paramsTemplate>;
