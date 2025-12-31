import { hc } from "hono/client";
import useSWRMutation from "swr/mutation";
import type { Api } from "./route.dev";

const client = hc<Api>("");

export function useMakeAudio() {
  return useSWRMutation("makeAudio", async (_: string, { arg: { phrase } }: { arg: { phrase: string } }) => {
    const response = await client.admin.api["generate-audio"].$post({ json: { phrase } });
    if (!response.ok) throw new Error();
    return await response.blob();
  });
}
export function useMakeImage() {
  return useSWRMutation(
    "makeImage",
    async (
      _: string,
      { arg: { phrase, extraInstructions } }: { arg: { phrase: string; extraInstructions: string } },
    ) => {
      const response = await client.admin.api["generate-image"].$post({
        json: { phrase, extraInstructions },
      });
      if (!response.ok) throw new Error();
      return await response.json();
    },
  );
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

const generatePhraseSuggestionEndpoint = client.admin.api["generate-phrase-suggestion"].$post;
type GeneratePhraseParams = Parameters<typeof generatePhraseSuggestionEndpoint>[0];
export function useMakePhraseSuggestions() {
  return useSWRMutation(
    "submit-for-suggestions",
    async (_: string, { arg: { json } }: { arg: GeneratePhraseParams }) => {
      const response = await generatePhraseSuggestionEndpoint({
        json,
      });
      if (!response.ok) throw new Error();
      return response.json();
    },
  );
}
