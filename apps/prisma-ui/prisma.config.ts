import "dotenv/config";
import { defineConfig } from "prisma/config";
import { resolve } from "node:path";
import { PrismaBetterSQLite3 } from "@prisma/adapter-better-sqlite3";

export default defineConfig({
  experimental: {
    studio: true,
  },
  studio: {
    adapter: async () => {
      const path = resolve(__dirname, process.env.DATABASE_URL!);
      console.log(path)
      return new PrismaBetterSQLite3({
        url: process.env.DATABASE_URL!,
      });
    },
  },
});
