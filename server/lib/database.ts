/**
 * Didar Gold Platform - Database Health & Diagnostics Engine
 * Real connection verification using `SELECT 1` on PostgreSQL.
 * Secure: Never leaks passwords, secrets, or internal connection strings.
 */

import fs from 'fs';
import path from 'path';
import { pingDatabase, getActiveEngine } from '../db/index.js';
import { K01Repository } from '../repositories/k01.repository.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const BACKUP_DIR = path.join(process.cwd(), 'data', 'backups');

export interface DatabaseHealthInfo {
  engine: 'postgresql_pool' | 'postgresql_local' | 'disconnected';
  status: 'connected' | 'healthy' | 'degraded' | 'error';
  databaseConfigured: boolean;
  persistenceMode: 'relational_postgresql';
  totalEntitiesCount: number;
  lastBackupTimestamp: string | null;
  message: string;
  latencyMs: number;
  timestamp: string;
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthInfo> {
  const ping = await pingDatabase();
  let totalEntities = 0;
  let lastBackup: string | null = null;

  // Check backups directory for latest backup timestamp
  try {
    if (fs.existsSync(BACKUP_DIR)) {
      const files = fs.readdirSync(BACKUP_DIR);
      if (files.length > 0) {
        const sorted = files
          .map((f) => ({ name: f, time: fs.statSync(path.join(BACKUP_DIR, f)).mtime.getTime() }))
          .sort((a, b) => b.time - a.time);
        lastBackup = new Date(sorted[0].time).toISOString();
      }
    }
  } catch {
    // Ignore backup inspection errors
  }

  if (!ping.ok) {
    return {
      engine: 'disconnected',
      status: 'error',
      databaseConfigured: Boolean(process.env.DATABASE_URL || process.env.POSTGRES_HOST),
      persistenceMode: 'relational_postgresql',
      totalEntitiesCount: 0,
      lastBackupTimestamp: lastBackup,
      message: `اتصال به پایگاه‌داده برقرار نشد: ${ping.error || 'خطای اتصال'}`,
      latencyMs: ping.latencyMs,
      timestamp: new Date().toISOString(),
    };
  }

  // Count entities from PostgreSQL repository
  try {
    const store = await K01Repository.getFullStore();
    totalEntities = store.persons.length + store.organizations.length + store.memberships.length;
  } catch (err: unknown) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error('[Health Check Store Read Error]:', errMsg);
  }

  const engineType = getActiveEngine() === 'pg_pool' ? 'postgresql_pool' : 'postgresql_local';

  return {
    engine: engineType,
    status: 'connected',
    databaseConfigured: true,
    persistenceMode: 'relational_postgresql',
    totalEntitiesCount: totalEntities,
    lastBackupTimestamp: lastBackup,
    message:
      engineType === 'postgresql_pool'
        ? 'پایگاه داده مستقل PostgreSQL اختصاصی فعال، سالم و متصل است (تأییدشده با SELECT 1).'
        : 'موتور پایگاه‌داده PostgreSQL محلی فعال، سالم و متصل است (تأییدشده با SELECT 1).',
    latencyMs: ping.latencyMs,
    timestamp: new Date().toISOString(),
  };
}

export async function createIndependentBackup(): Promise<{ success: boolean; path?: string; message: string }> {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
    }
    const store = await K01Repository.getFullStore();
    const filename = `kernel-backup-${Date.now()}.json`;
    const fullPath = path.join(BACKUP_DIR, filename);
    fs.writeFileSync(fullPath, JSON.stringify(store, null, 2), 'utf-8');
    return {
      success: true,
      path: filename,
      message: `نسخه پشتیبان پایگاه‌داده با موفقیت در ${filename} ذخیره گردید.`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'خطای نامشخص';
    return {
      success: false,
      message: `خطا در ایجاد نسخه پشتیبان: ${msg}`,
    };
  }
}
