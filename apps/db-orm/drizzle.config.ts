import 'dotenv/config'; // make sure to install dotenv package
import { defineConfig } from 'drizzle-kit';
import path from "node:path";

const resolvedPath = path.resolve(__dirname, "../www/local.db");

console.log(resolvedPath);


export default defineConfig({
  dialect: 'sqlite',
  out: './src/drizzle',
  schema: "./src/schema.ts",
  dbCredentials: {
    url:`file:${resolvedPath}`
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
  migrations: {
    table: 'drizzle-migrations', // `__drizzle_migrations` by default
  },
});
