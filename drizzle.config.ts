import { defineConfig } from 'drizzle-kit';

const databaseUrl = process.env.DATABASE_URL?.trim();

export default defineConfig({
  dialect: 'postgresql',
  schema: './server/database/schema.ts',
  out: './drizzle',
  strict: true,
  verbose: false,
  ...(databaseUrl ? { dbCredentials: { url: databaseUrl } } : {})
});
