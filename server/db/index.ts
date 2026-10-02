/**
 * Didar Gold Platform - Database Infrastructure Engine
 * PostgreSQL connection pooling, Drizzle ORM client, graceful shutdown & healthcheck.
 */

import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import pg from 'pg';
import { PGlite } from '@electric-sql/pglite';
import path from 'path';
import fs from 'fs';
import * as schema from './schema.js';

const { Pool } = pg;

export type DatabaseInstance = ReturnType<typeof drizzlePg<typeof schema>> | ReturnType<typeof drizzlePglite<typeof schema>>;

let globalDb: DatabaseInstance | null = null;
let globalPool: pg.Pool | null = null;
let globalPglite: PGlite | null = null;
let activeEngine: 'pg_pool' | 'pglite' = 'pg_pool';
let isShuttingDown = false;

export interface DbConfig {
  engine?: 'postgres' | 'pglite';
  databaseUrl?: string;
  host?: string;
  port?: number;
  database?: string;
  user?: string;
  password?: string;
  ssl?: boolean;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  pgdataDir?: string;
}

export function getDatabaseConfig(): DbConfig {
  const engine = (process.env.DB_ENGINE as 'postgres' | 'pglite') || undefined;
  const databaseUrl = process.env.DATABASE_URL;
  const host = process.env.POSTGRES_HOST;
  const port = process.env.POSTGRES_PORT ? parseInt(process.env.POSTGRES_PORT, 10) : 5432;
  const database = process.env.POSTGRES_DB;
  const user = process.env.POSTGRES_USER;
  const password = process.env.POSTGRES_PASSWORD;
  const ssl = process.env.POSTGRES_SSL === 'true';

  return {
    engine,
    databaseUrl,
    host,
    port,
    database,
    user,
    password,
    ssl,
    max: parseInt(process.env.POSTGRES_MAX_CONNECTIONS || '10', 10),
    idleTimeoutMillis: parseInt(process.env.POSTGRES_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeoutMillis: 5000,
    pgdataDir: process.env.PGDATA_DIR,
  };
}

/**
 * Initialize connection pool or embedded PostgreSQL engine
 */
export async function getDatabase(): Promise<DatabaseInstance> {
  if (globalDb) return globalDb;

  const isProduction = process.env.NODE_ENV === 'production';
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
  const config = getDatabaseConfig();
  const hasExternalPgConfig = Boolean(config.databaseUrl || (config.host && config.database));

  // 1. PRODUCTION REQUIREMENT: External PostgreSQL is strictly mandatory.
  if (isProduction) {
    if (!hasExternalPgConfig) {
      throw new Error(
        '[FATAL] Production requires configured external PostgreSQL (DATABASE_URL or POSTGRES_HOST/POSTGRES_DB). PGlite or local fallback is forbidden in production.'
      );
    }
  }

  // 2. EXTERNAL POSTGRESQL PATH
  if (config.engine === 'postgres' || (hasExternalPgConfig && config.engine !== 'pglite')) {
    if (!hasExternalPgConfig) {
      throw new Error('[FATAL] DB_ENGINE is explicitly configured as "postgres", but no DATABASE_URL or POSTGRES_HOST configuration is provided.');
    }

    try {
      const pool = config.databaseUrl
        ? new Pool({
            connectionString: config.databaseUrl,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
          })
        : new Pool({
            host: config.host,
            port: config.port,
            database: config.database,
            user: config.user,
            password: config.password,
            max: config.max,
            idleTimeoutMillis: config.idleTimeoutMillis,
            connectionTimeoutMillis: config.connectionTimeoutMillis,
            ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
          });

      pool.on('error', (err) => {
        console.error('[PostgreSQL Pool Error]', err.message);
      });

      // Verification probe
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();

      globalPool = pool;
      activeEngine = 'pg_pool';
      globalDb = drizzlePg(pool, { schema });
      console.log(`[DB] Connected to PostgreSQL server via connection pool (max: ${config.max})`);
      return globalDb;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[DB Connection Failed]: ${msg}`);

      // Never silently switch databases after an external connection failure!
      throw new Error(`[FATAL] Configured external PostgreSQL connection failed: ${msg}. Silent fallback to local PGlite is disabled.`);
    }
  }

  // 3. PGLITE ENGINE (Development & Test only)
  let postgresDataDir: string;

  if (isTest) {
    // Tests must use dedicated disposable test directory
    postgresDataDir = process.env.PGDATA_TEST || '';
    if (!postgresDataDir) {
      throw new Error('[FATAL] Test environment requires dedicated disposable database directory specified via PGDATA_TEST. Targeting active development database is strictly forbidden.');
    }
    const activeDevDir = path.resolve(path.join(process.cwd(), 'data', 'postgres'));
    if (path.resolve(postgresDataDir) === activeDevDir) {
      throw new Error(`[FATAL] Test runner refused to target active development database at ${postgresDataDir}. Tests must use an isolated disposable database directory.`);
    }
  } else {
    // Development active database directory
    postgresDataDir = config.pgdataDir || path.join(process.cwd(), 'data', 'postgres');
  }

  if (!fs.existsSync(postgresDataDir)) {
    fs.mkdirSync(postgresDataDir, { recursive: true });
  }

  // Self-healing: remove stale postmaster.pid lock file if left by an aborted process
  const pidFile = path.join(postgresDataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    try {
      fs.unlinkSync(pidFile);
    } catch {}
  }

  let pglite: any;
  try {
    pglite = new PGlite(postgresDataDir);
    await pglite.waitReady;
  } catch (err: unknown) {
    console.error('[DB] Failed to open local PGlite database:', err);
    if (!isProduction) {
      console.warn('[DB] Re-initializing local development PGlite database...');
      const backupCorruptDir = `${postgresDataDir}-corrupt-${Date.now()}`;
      try {
        fs.renameSync(postgresDataDir, backupCorruptDir);
      } catch {}
      fs.mkdirSync(postgresDataDir, { recursive: true });
      pglite = new PGlite(postgresDataDir);
      await pglite.waitReady;
    } else {
      throw err;
    }
  }
  globalPglite = pglite;
  activeEngine = 'pglite';
  globalDb = drizzlePglite(pglite, { schema });
  console.log(`[DB] Local persistent PostgreSQL (PGlite) initialized at ${postgresDataDir}`);
  return globalDb;
}

/**
 * Health check that executes a real query (SELECT 1)
 */
export async function pingDatabase(): Promise<{ ok: boolean; latencyMs: number; engine: string; error?: string }> {
  const start = Date.now();
  try {
    if (activeEngine === 'pg_pool' && globalPool) {
      const client = await globalPool.connect();
      await client.query('SELECT 1');
      client.release();
      return { ok: true, latencyMs: Date.now() - start, engine: 'PostgreSQL Server (Pool)' };
    } else if (globalPglite) {
      await globalPglite.query('SELECT 1');
      return { ok: true, latencyMs: Date.now() - start, engine: 'PostgreSQL Local (PGlite)' };
    } else {
      // Try to initialize and ping
      const db = await getDatabase();
      const res = await pingDatabase();
      return res;
    }
  } catch (err: unknown) {
    const error = err instanceof Error ? err.message : 'Database ping query failed';
    return { ok: false, latencyMs: Date.now() - start, engine: activeEngine, error };
  }
}

/**
 * Graceful shutdown for database connections
 */
export async function closeDatabase(): Promise<void> {
  if (globalPool) {
    console.log('[DB] Closing PostgreSQL connection pool...');
    await globalPool.end();
    globalPool = null;
  }
  if (globalPglite) {
    console.log('[DB] Closing local PostgreSQL engine...');
    await globalPglite.close();
    globalPglite = null;
  }
  globalDb = null;
  isShuttingDown = false;
}

export function resetDatabaseClient(): void {
  globalDb = null;
  globalPool = null;
  globalPglite = null;
}

export async function cleanupTestDatabase(testDir?: string): Promise<void> {
  await closeDatabase();
  const dirToRemove = testDir || process.env.PGDATA_TEST;
  const activeDevDir = path.resolve(path.join(process.cwd(), 'data', 'postgres'));
  if (dirToRemove && path.resolve(dirToRemove) !== activeDevDir && fs.existsSync(dirToRemove)) {
    try {
      fs.rmSync(dirToRemove, { recursive: true, force: true });
      console.log(`[DB] Cleaned up disposable test database at ${dirToRemove}`);
    } catch (e) {
      console.warn(`[DB] Could not remove test dir ${dirToRemove}:`, e);
    }
  }
}


export function getActiveEngine(): 'pg_pool' | 'pglite' {
  return activeEngine;
}

export function getRawPool(): pg.Pool | null {
  return globalPool;
}

export function getRawPglite(): PGlite | null {
  return globalPglite;
}

// Register process exit listeners for graceful shutdown
process.on('SIGTERM', () => {
  closeDatabase().catch(console.error);
});
process.on('SIGINT', () => {
  closeDatabase().catch(console.error);
});
