/**
 * Didar Gold Platform - Legacy Compatibility Adapter
 * Delegates to the independent database engine without any @supabase/supabase-js dependency.
 */

import { checkDatabaseHealth, createIndependentBackup } from './database.js';
import { K01DataPayload } from '../../src/types/k01.js';

export async function checkSupabaseHealth() {
  const dbHealth = await checkDatabaseHealth();
  return {
    configured: true,
    url: dbHealth.dataDirectory,
    hasSecretKey: true,
    hasPublishableKey: true,
    hasJwksUrl: false,
    status: 'connected' as const,
    message: dbHealth.message,
    authActive: true,
    latencyMs: dbHealth.latencyMs,
    engine: dbHealth.engine,
    vendorLockIn: false
  };
}

export async function syncSnapshotToSupabase(store: K01DataPayload) {
  return createIndependentBackup(store);
}
