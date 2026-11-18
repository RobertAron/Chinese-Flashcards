import { hc } from "hono/client";
import useSWRMutation from "swr/mutation";
import type { Api } from "./route.dev";

const client = hc<Api>("");

export function useDeletePhrase() {
  return useSWRMutation("deletePhrase", async (_: string, { arg: id }: { arg: number }) => {
    const response = await client.admin.xiaohei.api.phrases[":id"].$delete({ param: { id: `${id}` } });
    if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  });
}
export function useTrimPhraseAudio() {
  return useSWRMutation(
    "trimPhraseAudio",
    async (_: string, { arg: { id, start, end } }: { arg: { id: number; start: number; end: number } }) => {
      const response = await client.admin.xiaohei.api.phrases[":id"].trim.$post({
        param: { id: `${id}` },
        json: { start, end },
      });
      if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
    },
  );
}
export function useResetPhraseAudio() {
  return useSWRMutation("resetPhraseAudio", async (_: string, { arg: id }: { arg: number }) => {
    const response = await client.admin.xiaohei.api.phrases[":id"]["reset-audio"].$post({
      param: { id: `${id}` },
    });
    if (!response.ok) throw new Error((await response.text()) || `Request failed (${response.status})`);
  });
}
