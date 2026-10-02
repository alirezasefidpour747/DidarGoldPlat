import path from 'path';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { closeDatabasePool, getDatabase } from '../server/database/client.js';

try {
  await migrate(getDatabase(), { migrationsFolder: path.resolve('drizzle') });
  console.log('Database migrations applied successfully.');
} catch {
  console.error('Database migration failed. Connection details were redacted.');
  process.exitCode = 1;
} finally {
  await closeDatabasePool();
}
