import "dotenv/config";
import { resolve } from "node:path";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";
import { defineConfig } from "prisma/config";

const path = resolve(__dirname, "./local.db");
const url = `file:${path}`;
const adapter = async () =>
  new PrismaBetterSQLite3({
    url,
  });
export default defineConfig({
  engine: "js",
  experimental: {
    studio: true,
    adapter: true,
  },
  adapter,
  studio: {
    adapter,
  },
});
