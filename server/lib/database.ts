/** Truthful PostgreSQL health/readiness checks for Package 2. */

import { executeQuery } from '../database/client.js';

export type PostgreSqlStatus = 'ready' | 'unavailable' | 'not_configured';

export interface DatabaseHealthInfo {
  engine: 'postgresql';
  status: PostgreSqlStatus;
  ready: boolean;
  required: true;
  databaseUrlConfigured: boolean;
  connectivityVerified: boolean;
  persistenceMode: 'postgresql';
  message: string;
  latencyMs: number;
}

export interface RuntimeReadiness {
  ready: boolean;
  dependencies: {
    postgresql: PostgreSqlStatus;
    authentication: 'not_implemented';
    authorization: 'not_implemented';
    k02ToK20Persistence: 'not_implemented';
    externalIntegrations: 'not_configured';
  };
}

function readinessTimeoutMs(): number {
  const raw = process.env.DATABASE_READINESS_TIMEOUT_MS;
  if (!raw) return 2_000;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error('Configuration error: DATABASE_READINESS_TIMEOUT_MS must be a positive integer.');
  }
  return value;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthInfo> {
  const startedAt = Date.now();
  if (!process.env.DATABASE_URL?.trim()) {
    return {
      engine: 'postgresql',
      status: 'not_configured',
      ready: false,
      required: true,
      databaseUrlConfigured: false,
      connectivityVerified: false,
      persistenceMode: 'postgresql',
      message: 'PostgreSQL is required but DATABASE_URL is not configured.',
      latencyMs: Date.now() - startedAt
    };
  }

  const timeoutMs = readinessTimeoutMs();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => reject(new Error('readiness timeout')), timeoutMs);
    });
    const result = await Promise.race([
      executeQuery<{ ok: number }>('select 1::int as ok'),
      timeoutPromise
    ]);
    const verified = result.rows[0]?.ok === 1;
    return {
      engine: 'postgresql',
      status: verified ? 'ready' : 'unavailable',
      ready: verified,
      required: true,
      databaseUrlConfigured: true,
      connectivityVerified: verified,
      persistenceMode: 'postgresql',
      message: verified
        ? 'PostgreSQL responded to a real SELECT 1 query.'
        : 'PostgreSQL returned an unexpected readiness result.',
      latencyMs: Date.now() - startedAt
    };
  } catch {
    return {
      engine: 'postgresql',
      status: 'unavailable',
      ready: false,
      required: true,
      databaseUrlConfigured: true,
      connectivityVerified: false,
      persistenceMode: 'postgresql',
      message: 'PostgreSQL connectivity could not be verified.',
      latencyMs: Date.now() - startedAt
    };
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

export async function checkRuntimeReadiness(): Promise<RuntimeReadiness> {
  const database = await checkDatabaseHealth();
  const productionControlsImplemented = false;
  return {
    ready: database.ready && (process.env.NODE_ENV !== 'production' || productionControlsImplemented),
    dependencies: {
      postgresql: database.status,
      authentication: 'not_implemented',
      authorization: 'not_implemented',
      k02ToK20Persistence: 'not_implemented',
      externalIntegrations: 'not_configured'
    }
  };
}
