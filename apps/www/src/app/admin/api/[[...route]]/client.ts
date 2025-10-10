import { hc } from "hono/client";
import useSWRMutation from "swr/mutation";
import type { Api } from "./route";

const client = hc<Api>("");

export function useMakeAudio() {
  return useSWRMutation("makeAudio", async (_: string, { arg: { phrase } }: { arg: { phrase: string } }) => {
    console.log({ phrase });
    const response = await client.admin.api["generate-audio"].$post({ json: { phrase } });
    if (!response.ok) throw new Error();
    return await response.blob();
  });
}
export function useMakeImage() {
  return useSWRMutation("makeImage", async (_: string, { arg: { phrase } }: { arg: { phrase: string } }) => {
    const response = await client.admin.api["generate-image"].$post({ json: { phrase } });
    if (!response.ok) throw new Error();
    return await response.json();
  });
}
