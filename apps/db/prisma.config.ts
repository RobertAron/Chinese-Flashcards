import "dotenv/config";
import { resolve } from "node:path";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { defineConfig } from "prisma/config";

const path = resolve(__dirname, "./local.db");
const url = `file:${path}`;
const adapter = async () =>
  new PrismaLibSQL({
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
