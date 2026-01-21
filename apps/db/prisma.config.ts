import "dotenv/config";
import { resolve } from "node:path";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { defineConfig, type PrismaConfig } from "prisma/config";

const path = resolve(__dirname, "./local.db");
const url = `file:${path}`;

const adapter = async () =>
  new PrismaLibSQL({
    url,
  });
const normalConfig: PrismaConfig = {
  engine: "js",
  experimental: {
    studio: true,
    adapter: true,
  },
  migrations: {
    path: "./prisma/migrations",
  },
  adapter,
  studio: {
    adapter,
  },
};
const migrationConfig: PrismaConfig = {
  engine: "classic",
  experimental: {
    studio: true,
    adapter: true,
  },
  migrations: {
    path: "./prisma/migrations",
  },
  datasource: {
    url,
  },
};
export default defineConfig(process.argv.includes("migrate") ? migrationConfig : normalConfig);
