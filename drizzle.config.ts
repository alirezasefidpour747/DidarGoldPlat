import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  schema: './server/db/schema.ts',
  out: './server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.POSTGRES_USER || 'didar_user'}:${process.env.POSTGRES_PASSWORD || 'didar_gold_secret_db_pass_2026'}@${process.env.POSTGRES_HOST || 'localhost'}:${process.env.POSTGRES_PORT || 5432}/${process.env.POSTGRES_DB || 'didar_gold_db'}`,
  },
  verbose: true,
  strict: true,
});
