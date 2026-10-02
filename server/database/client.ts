import { drizzle, type NodePgDatabase, type NodePgTransaction } from 'drizzle-orm/node-postgres';
import type { ExtractTablesWithRelations } from 'drizzle-orm';
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from 'pg';
import * as schema from './schema.js';

const DEFAULT_POOL_MAX = 10;
const DEFAULT_IDLE_TIMEOUT_MS = 10_000;
const DEFAULT_CONNECT_TIMEOUT_MS = 3_000;
const DEFAULT_QUERY_TIMEOUT_MS = 10_000;

let pool: Pool | null = null;
let database: NodePgDatabase<typeof schema> | null = null;

function positiveInteger(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Configuration error: ${name} must be a positive integer.`);
  }
  return value;
}

export function getDatabaseUrl(): string {
  const value = process.env.DATABASE_URL?.trim();
  if (!value) throw new Error('Configuration error: DATABASE_URL is required.');
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error('Configuration error: DATABASE_URL must be a valid PostgreSQL URL.');
  }
  if (!['postgres:', 'postgresql:'].includes(parsed.protocol)) {
    throw new Error('Configuration error: DATABASE_URL must use the PostgreSQL protocol.');
  }
  if (!parsed.hostname || !parsed.pathname || parsed.pathname === '/') {
    throw new Error('Configuration error: DATABASE_URL must include a host and database name.');
  }
  return value;
}

export function getPool(): Pool {
  if (pool) return pool;
  pool = new Pool({
    connectionString: getDatabaseUrl(),
    max: positiveInteger('DATABASE_POOL_MAX', DEFAULT_POOL_MAX),
    idleTimeoutMillis: positiveInteger('DATABASE_IDLE_TIMEOUT_MS', DEFAULT_IDLE_TIMEOUT_MS),
    connectionTimeoutMillis: positiveInteger('DATABASE_CONNECT_TIMEOUT_MS', DEFAULT_CONNECT_TIMEOUT_MS),
    query_timeout: positiveInteger('DATABASE_QUERY_TIMEOUT_MS', DEFAULT_QUERY_TIMEOUT_MS),
    application_name: 'didar-gold-k01'
  });
  pool.on('error', () => {
    console.error('[Database] An idle PostgreSQL connection failed.');
  });
  return pool;
}

export function getDatabase(): NodePgDatabase<typeof schema> {
  if (!database) database = drizzle(getPool(), { schema });
  return database;
}

export type DatabaseTransaction = NodePgTransaction<
  typeof schema,
  ExtractTablesWithRelations<typeof schema>
>;

export async function executeQuery<TRow extends QueryResultRow = QueryResultRow>(
  text: string,
  values: readonly unknown[] = []
): Promise<QueryResult<TRow>> {
  return getPool().query<TRow>(text, [...values]);
}

export async function withPoolClient<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    return await work(client);
  } finally {
    client.release();
  }
}

export async function withTransaction<T>(
  work: (transaction: DatabaseTransaction) => Promise<T>
): Promise<T> {
  return getDatabase().transaction(async (transaction) => work(transaction));
}

export async function closeDatabasePool(): Promise<void> {
  const current = pool;
  pool = null;
  database = null;
  if (current) await current.end();
}

export function resetDatabaseForTests(): void {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('resetDatabaseForTests is only available in NODE_ENV=test.');
  }
  pool = null;
  database = null;
}
