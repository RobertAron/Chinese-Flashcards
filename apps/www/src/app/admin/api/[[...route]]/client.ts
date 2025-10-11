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
export function useSubmitChallenge() {
  return useSWRMutation(
    "submitChallenge",
    async (_: string, { arg: { audio } }: { arg: { audio: File } }) => {
      const response = await client.admin.api["submit-challenge"].$post({ form: { audio } });
      if (!response.ok) throw new Error();
      const blob = await response.blob();

      // Create a temporary download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "response-file"; // optionally add an extension like .wav, .zip, etc.
      a.click();
      window.URL.revokeObjectURL(url);

      return blob;
    },
  );
}
