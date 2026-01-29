import * as z from "zod/v4-mini";

export const paramsTemplate = z.object({
  wordId: z.coerce.number<string>(),
});
export type InputParamsShape = z.input<typeof paramsTemplate>
export type ParamsShape = z.infer<typeof paramsTemplate>;
