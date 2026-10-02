/**
 * Didar Gold Platform - Local JSON Storage Helper
 * 
 * Responsibilities:
 * This helper provides process-local locks and whole-file temp/rename writes.
 * It is not a relational database, a durable WAL, or an ACID transaction engine.
 */

import fs from 'fs';
import path from 'path';

export interface TransactionContext {
  id: string;
  startedAt: number;
  isolationLevel: 'READ_COMMITTED' | 'SERIALIZABLE';
  modifiedCollections: Set<string>;
}

export interface DatabaseTelemetry {
  engineType: 'local_json_file_store';
  status: 'available' | 'degraded';
  persistenceMode: 'partial_json_file_storage';
  dataDirectory: string;
  backupDirectory: string;
  totalCollections: number;
  totalRecordsCount: number;
  diskUsageBytes: number;
  diskUsageFormatted: string;
  walStatus: 'not_implemented';
  activeLocksCount: number;
  lastSnapshotTimestampFa: string;
  latencyMs: number;
}

export class DatabaseEngine {
  private static instance: DatabaseEngine;
  private dataDir: string;
  private backupDir: string;
  private activeLocks: Map<string, boolean> = new Map();
  private walLog: Array<{ id: string; timestamp: number; operation: string; collection: string }> = [];

  private constructor() {
    this.dataDir = path.join(process.cwd(), 'data');
    this.backupDir = path.join(process.cwd(), 'data', 'backups');

    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  public static getInstance(): DatabaseEngine {
    if (!DatabaseEngine.instance) {
      DatabaseEngine.instance = new DatabaseEngine();
    }
    return DatabaseEngine.instance;
  }

  /**
   * Acquire a process-local write lock on a collection file.
   */
  public async acquireLock(collection: string): Promise<() => void> {
    while (this.activeLocks.get(collection)) {
      await new Promise(resolve => setTimeout(resolve, 5));
    }
    this.activeLocks.set(collection, true);

    return () => {
      this.activeLocks.delete(collection);
    };
  }

  /**
   * Read a JSON collection file.
   */
  public readCollection<T>(collectionName: string, defaultValue: T): T {
    const filePath = path.join(this.dataDir, `${collectionName}.json`);
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(raw) as T;
      }
    } catch (err) {
      console.warn(`[DatabaseEngine] Could not read collection ${collectionName}, using in-memory/default state`, err);
    }
    return defaultValue;
  }

  /**
   * Write one JSON file using a temp-file rename.
   */
  public async writeCollection<T>(collectionName: string, data: T): Promise<void> {
    const release = await this.acquireLock(collectionName);
    const start = Date.now();
    try {
      const tempPath = path.join(this.dataDir, `${collectionName}.tmp.${Date.now()}`);
      const finalPath = path.join(this.dataDir, `${collectionName}.json`);

      // Write to temp file first for atomic rename guarantee
      fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempPath, finalPath);

      // Process-local operation history only; this is not a durable WAL.
      this.walLog.push({
        id: `wal-${Date.now()}`,
        timestamp: Date.now(),
        operation: 'ATOMIC_WRITE',
        collection: collectionName
      });

      if (this.walLog.length > 500) {
        this.walLog = this.walLog.slice(-100);
      }
    } finally {
      release();
    }
  }

  /**
   * Begin process-local transaction metadata (no rollback/isolation guarantee).
   */
  public beginTransaction(): TransactionContext {
    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      startedAt: Date.now(),
      isolationLevel: 'SERIALIZABLE',
      modifiedCollections: new Set()
    };
  }

  /**
   * Record a process-local commit marker.
   */
  public commitTransaction(tx: TransactionContext): void {
    this.walLog.push({
      id: `wal-commit-${tx.id}`,
      timestamp: Date.now(),
      operation: 'TRANSACTION_COMMIT',
      collection: Array.from(tx.modifiedCollections).join(',')
    });
  }

  /**
   * Perform snapshot backup
   */
  public createSnapshotBackup(): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const snapshotPath = path.join(this.backupDir, `snapshot-${timestamp}.json`);
    
    // Read all JSON collections in dataDir
    const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
    const dump: Record<string, any> = {};
    for (const file of files) {
      try {
        const content = fs.readFileSync(path.join(this.dataDir, file), 'utf-8');
        dump[file.replace('.json', '')] = JSON.parse(content);
      } catch (err) {
        // continue
      }
    }

    fs.writeFileSync(snapshotPath, JSON.stringify(dump, null, 2), 'utf-8');
    return snapshotPath;
  }

  /**
   * Telemetry inspection for Layer 5
   */
  public getTelemetry(): DatabaseTelemetry {
    const start = Date.now();
    let totalSize = 0;
    let collectionsCount = 0;
    let totalRecordsCount = 0;
    let status: 'available' | 'degraded' = 'available';
    let lastSnapshotTimestampFa = 'ثبت نشده';

    try {
      if (fs.existsSync(this.dataDir)) {
        const files = fs.readdirSync(this.dataDir).filter(f => f.endsWith('.json'));
        collectionsCount = files.length;
        for (const file of files) {
          totalSize += fs.statSync(path.join(this.dataDir, file)).size;
          try {
            const parsed = JSON.parse(fs.readFileSync(path.join(this.dataDir, file), 'utf-8'));
            if (Array.isArray(parsed)) totalRecordsCount += parsed.length;
            else if (parsed && typeof parsed === 'object') {
              totalRecordsCount += Object.values(parsed as Record<string, unknown>).reduce<number>(
                (count: number, value) => count + (Array.isArray(value) ? value.length : 0),
                0
              );
            }
          } catch {
            status = 'degraded';
          }
        }
        const snapshots = fs.existsSync(this.backupDir)
          ? fs.readdirSync(this.backupDir).map((file) => fs.statSync(path.join(this.backupDir, file)).mtimeMs)
          : [];
        if (snapshots.length > 0) {
          lastSnapshotTimestampFa = new Date(Math.max(...snapshots)).toLocaleString('fa-IR');
        }
      }
    } catch {
      status = 'degraded';
    }

    const mbSize = (totalSize / (1024 * 1024)).toFixed(2);

    return {
      engineType: 'local_json_file_store',
      status,
      persistenceMode: 'partial_json_file_storage',
      dataDirectory: this.dataDir,
      backupDirectory: this.backupDir,
      totalCollections: collectionsCount,
      totalRecordsCount,
      diskUsageBytes: totalSize,
      diskUsageFormatted: `${mbSize} مگابایت`,
      walStatus: 'not_implemented',
      activeLocksCount: this.activeLocks.size,
      lastSnapshotTimestampFa,
      latencyMs: Date.now() - start
    };
  }
}

export const databaseEngine = DatabaseEngine.getInstance();
