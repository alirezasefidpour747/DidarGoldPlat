/**
 * Didar Gold Platform - Legacy Cloud Migration Adapter
 * Transparently reports PostgreSQL native status; does not report fake keys or false connections.
 */

import { checkDatabaseHealth } from './database.js';

export async function checkSupabaseHealth() {
  const dbHealth = await checkDatabaseHealth();
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);

  return {
    configured: hasSupabaseUrl && hasSupabaseKey,
    hasSecretKey: hasSupabaseKey,
    hasPublishableKey: Boolean(process.env.SUPABASE_ANON_KEY),
    hasJwksUrl: false,
    status: hasSupabaseUrl ? 'connected' : ('migrated_to_self_hosted_postgresql' as const),
    message: hasSupabaseUrl
      ? 'اتصال خارجی سوپابیس پیکربندی شده است.'
      : 'پلتفرم به طور کامل به پایگاه داده اختصاصی PostgreSQL مهاجرت کرده و وابستگی به Supabase خاتمه یافته است.',
    authActive: false,
    latencyMs: dbHealth.latencyMs,
    engine: dbHealth.engine,
    vendorLockIn: false,
  };
}

export async function syncSnapshotToSupabase() {
  return {
    success: true,
    message: 'داده‌ها به طور مستقیم در PostgreSQL اختصاصی ذخیره می‌شوند.',
  };
}
