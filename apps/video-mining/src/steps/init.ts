import { existsSync } from "node:fs";
import { join } from "node:path";
import { run } from "../media";
import { projectConfigSchema, projectPaths, saveProjectConfig } from "../project";

/** Probes the video and writes project.json with defaults. Check subtitleBand and imageArea before running `ocr`. */
export async function init(folder: string, video: string, { force = false } = {}) {
  const paths = projectPaths(folder);
  if (existsSync(paths.configFile) && !force)
    throw new Error(`${paths.configFile} exists. Pass --force to overwrite.`);
  const probe = JSON.parse(
    await run([
      ...["ffprobe", "-v", "error", "-select_streams", "v:0"],
      ...["-show_entries", "stream=width,height,color_transfer", "-of", "json", join(paths.root, video)],
    ]),
  );
  const { width, height, color_transfer } = probe.streams[0];
  const subtitleBand = {
    x: Math.round(width * 0.15),
    y: Math.round(height * 0.87),
    width: Math.round(width * 0.7),
    height: Math.round(height * 0.115),
  };
  const config = projectConfigSchema.parse({
    video,
    width,
    height,
    hdr: color_transfer === "smpte2084" || color_transfer === "arib-std-b67",
    subtitleBand,
    imageArea: { y: 0, height: Math.min(subtitleBand.y, width) },
  });
  await saveProjectConfig(folder, config);
  console.log(`Wrote ${paths.configFile}:\n${JSON.stringify(config, null, 2)}`);
}
