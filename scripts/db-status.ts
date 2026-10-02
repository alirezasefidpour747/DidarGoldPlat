import fs from 'fs';
import { closeDatabasePool, executeQuery } from '../server/database/client.js';

try {
  const journal = JSON.parse(fs.readFileSync('drizzle/meta/_journal.json', 'utf8')) as {
    entries?: unknown[];
  };
  const expected = journal.entries?.length ?? 0;
  const table = await executeQuery<{ exists: string | null }>(
    "select to_regclass('drizzle.__drizzle_migrations')::text as exists"
  );
  const applied = table.rows[0]?.exists
    ? Number((await executeQuery<{ count: string }>('select count(*)::text as count from drizzle.__drizzle_migrations')).rows[0]?.count ?? 0)
    : 0;
  console.log(JSON.stringify({ expectedMigrations: expected, appliedMigrations: applied, current: applied === expected }));
  if (applied !== expected) process.exitCode = 1;
} catch {
  console.error('Database migration status check failed. Connection details were redacted.');
  process.exitCode = 1;
} finally {
  await closeDatabasePool();
}
