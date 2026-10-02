/**
 * Didar Gold Platform - Versioned Migration Runner
 * Applies SQL migrations to PostgreSQL idempotently with schema tracking.
 */

import fs from 'fs';
import path from 'path';
import { getDatabase, getRawPool, getRawPglite, getActiveEngine } from './index.js';

export interface MigrationResult {
  appliedCount: number;
  appliedMigrations: string[];
  alreadyApplied: string[];
  totalStatements: number;
}

export async function runMigrations(): Promise<MigrationResult> {
  await getDatabase(); // Ensure connection is established

  const pool = getRawPool();
  const pglite = getRawPglite();
  const engine = getActiveEngine();

  const migrationsDir = path.join(process.cwd(), 'server', 'db', 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    throw new Error(`Migrations directory not found at ${migrationsDir}`);
  }

  // Create migration tracking table if not exists
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS "__didar_migrations" (
      "id" SERIAL PRIMARY KEY,
      "migration_name" VARCHAR(255) NOT NULL UNIQUE,
      "applied_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
    );
  `;

  if (pool) {
    await pool.query(createTableQuery);
  } else if (pglite) {
    await pglite.query(createTableQuery);
  }

  // Fetch already applied migrations
  let appliedRows: { migration_name: string }[] = [];
  if (pool) {
    const res = await pool.query('SELECT migration_name FROM "__didar_migrations"');
    appliedRows = res.rows;
  } else if (pglite) {
    const res = await pglite.query<{ migration_name: string }>('SELECT migration_name FROM "__didar_migrations"');
    appliedRows = res.rows;
  }

  const alreadyApplied = appliedRows.map((r) => r.migration_name);
  const sqlFiles = fs
    .readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const appliedMigrations: string[] = [];
  let totalStatements = 0;

  for (const file of sqlFiles) {
    if (alreadyApplied.includes(file)) {
      continue;
    }

    console.log(`[Migration] Applying ${file}...`);
    const filePath = path.join(migrationsDir, file);
    const sqlContent = fs.readFileSync(filePath, 'utf-8');

    // Split statements on breakpoint marker
    const statements = sqlContent
      .split('--> statement-breakpoint')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    totalStatements += statements.length;

    if (pool) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        for (const statement of statements) {
          await client.query(statement);
        }
        await client.query('INSERT INTO "__didar_migrations" (migration_name) VALUES ($1)', [file]);
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        client.release();
        throw err;
      }
      client.release();
    } else if (pglite) {
      await pglite.query('BEGIN');
      try {
        for (const statement of statements) {
          await pglite.query(statement);
        }
        await pglite.query('INSERT INTO "__didar_migrations" (migration_name) VALUES ($1)', [file]);
        await pglite.query('COMMIT');
      } catch (err) {
        await pglite.query('ROLLBACK');
        throw err;
      }
    }

    appliedMigrations.push(file);
    console.log(`[Migration] Successfully applied ${file}`);
  }

  return {
    appliedCount: appliedMigrations.length,
    appliedMigrations,
    alreadyApplied,
    totalStatements,
  };
}

// CLI execution helper
if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then((res) => {
      console.log('[Migration] Finished:', res);
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration Error]:', err);
      process.exit(1);
    });
}
