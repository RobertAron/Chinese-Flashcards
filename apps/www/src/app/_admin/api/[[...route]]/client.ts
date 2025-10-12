import { hc } from "hono/client";
import useSWRMutation from "swr/mutation";
import type { Api } from "./route";

const client = hc<Api>("");

export function useMakeAudio() {
  return useSWRMutation("makeAudio", async (_: string, { arg: { phrase } }: { arg: { phrase: string } }) => {
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

const submitChallenge = client.admin.api["submit-challenge"].$post;
type SubmitChallengeProps = Parameters<typeof submitChallenge>[0];
export function useSubmitChallenge() {
  return useSWRMutation(
    "submitChallenge",
    async (_: string, { arg: { form } }: { arg: SubmitChallengeProps }) => {
      const response = await submitChallenge({ form });
      if (!response.ok) throw new Error();
      return response.json();
    },
  );
}
