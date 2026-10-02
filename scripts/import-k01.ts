import path from 'path';
import { closeDatabasePool } from '../server/database/client.js';
import { importK01Json } from '../server/services/k01-import.service.js';

const sourcePath = process.env.K01_IMPORT_FILE?.trim();
const backupDirectory = process.env.K01_IMPORT_BACKUP_DIR || path.join('data', 'import-backups');

try {
  if (!sourcePath) {
    throw new Error('K01_IMPORT_FILE is not configured. Clean-schema mode does not import legacy data.');
  }
  const legacyDemoPath = path.resolve('data', 'didar-kernel-store.json');
  if (path.resolve(sourcePath) === legacyDemoPath) {
    throw new Error('The legacy didar-kernel-store.json file is owner-classified demo data and cannot be imported.');
  }
  const result = await importK01Json({ sourcePath, backupDirectory });
  console.log(JSON.stringify({
    source: result.source,
    inserted: result.inserted,
    skipped: result.skipped,
    rejected: result.rejected,
    destination: result.destination,
    backupCreated: true
  }));
  if (result.rejected.length > 0) process.exitCode = 2;
} catch (error) {
  const message = error instanceof Error ? error.message : 'K01 import failed.';
  console.error(message.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, '[REDACTED_DATABASE_URL]'));
  process.exitCode = 1;
} finally {
  await closeDatabasePool();
}
