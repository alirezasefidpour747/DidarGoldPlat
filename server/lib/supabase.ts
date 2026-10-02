/**
 * Legacy route-name compatibility adapter.
 * Supabase and authentication connectivity are not implemented.
 */

import { checkDatabaseHealth } from './database.js';

export async function checkSupabaseHealth() {
  const storage = await checkDatabaseHealth();
  return {
    configured: false,
    status: 'not_implemented' as const,
    authActive: false,
    connectivityVerified: false,
    message: 'Supabase connectivity and authentication are not implemented.',
    postgresql: storage.status
  };
}

export async function syncSnapshotToSupabase() {
  return {
    success: false,
    message: 'Supabase synchronization is not implemented; PostgreSQL is the K01 system of record.'
  };
}
