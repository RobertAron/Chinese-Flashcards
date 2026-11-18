import { zValidator } from "@hono/zod-validator";
import { S3Client } from "bun";
import { Hono } from "hono";
import { handle } from "hono/vercel";
import z from "zod";
import { getPrismaClient } from "@/utils/getPrismaClient";

const r2 = new S3Client({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY,
  endpoint: process.env.CF_R2_ENDPOINT,
});

// Dev-only endpoints for the Xiaohei review page: delete a phrase, trim its audio, restore the original.
const app = new Hono()
  .basePath("/admin/xiaohei/api")
  .delete("/phrases/:id", zValidator("param", z.object({ id: z.coerce.number().int() })), async (c) => {
    const { id } = c.req.valid("param");
    // PhraseWords and drill links cascade with the phrase.
    await getPrismaClient().phrases.delete({ where: { id } });
    await Promise.all([
      r2.delete(`phrases/${id}.mp3`),
      r2.delete(`phrases/${id}.webp`),
      r2.delete(`phrases-original/${id}.mp3`),
    ]);
    return c.json({ message: "OK" });
  })
  .post(
    "/phrases/:id/trim",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    zValidator(
      "json",
      z
        .object({ start: z.number().min(0), end: z.number().positive() })
        .refine(({ start, end }) => end > start),
    ),
    async (c) => {
      const { id } = c.req.valid("param");
      const { start, end } = c.req.valid("json");
      const current = await r2.file(`phrases/${id}.mp3`).arrayBuffer();
      // Keep the first version so a bad trim can be undone with /reset.
      const original = r2.file(`phrases-original/${id}.mp3`);
      if (!(await original.exists())) await original.write(current);
      const fade = Math.min(0.03, (end - start) / 4);
      const ffmpeg = Bun.spawn(
        [
          "ffmpeg",
          "-hide_banner",
          "-loglevel",
          "error",
          "-i",
          "pipe:0",
          // Cut inside the filter chain: with -ss/-to the fades run on the untrimmed timeline and can
          // silence the kept part. asetpts restarts timestamps at 0 so the fade times are relative to the cut.
          "-af",
          [
            `atrim=start=${start}:end=${end}`,
            "asetpts=PTS-STARTPTS",
            `afade=t=in:d=${fade}`,
            `afade=t=out:st=${end - start - fade}:d=${fade}`,
          ].join(","),
          "-c:a",
          "libmp3lame",
          "-q:a",
          "2",
          "-f",
          "mp3",
          "pipe:1",
        ],
        { stdin: new Uint8Array(current), stdout: "pipe", stderr: "pipe" },
      );
      const [trimmed, errors, exitCode] = await Promise.all([
        new Response(ffmpeg.stdout).arrayBuffer(),
        new Response(ffmpeg.stderr).text(),
        ffmpeg.exited,
      ]);
      if (exitCode !== 0 || trimmed.byteLength === 0)
        return c.text(errors || "ffmpeg failed", { status: 500 });
      await r2.write(`phrases/${id}.mp3`, trimmed, { type: "audio/mpeg" });
      return c.json({ message: "OK" });
    },
  )
  .post(
    "/phrases/:id/reset-audio",
    zValidator("param", z.object({ id: z.coerce.number().int() })),
    async (c) => {
      const { id } = c.req.valid("param");
      const original = r2.file(`phrases-original/${id}.mp3`);
      if (!(await original.exists())) return c.text("Nothing to reset", { status: 404 });
      await r2.write(`phrases/${id}.mp3`, await original.arrayBuffer(), { type: "audio/mpeg" });
      await original.delete();
      return c.json({ message: "OK" });
    },
  );

export type Api = typeof app;

export const POST = handle(app);
export const DELETE = handle(app);
