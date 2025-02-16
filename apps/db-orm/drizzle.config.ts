import 'dotenv/config'; // make sure to install dotenv package
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  out: './src/drizzle',
  schema: './src/drizzle/schema.ts',
  dbCredentials: {
    url:"file:../www/local.db"
  },
  // Print all statements
  verbose: true,
  // Always ask for confirmation
  strict: true,
});
