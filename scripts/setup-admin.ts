/**
 * Didar Gold Platform - Administrator Initial Provisioning CLI
 * Secure initialization of initial administrator credentials without demo or hard-coded accounts.
 *
 * Usage:
 *   npx tsx scripts/setup-admin.ts --mobile 09121112233 --password <secure-password> --name "علیرضا سفیدپور"
 *   OR via environment variables:
 *   ADMIN_MOBILE=09121112233 ADMIN_PASSWORD=<password> npx tsx scripts/setup-admin.ts
 */

import { getDatabase, closeDatabase } from '../server/db/index.js';
import { runMigrations } from '../server/db/migrate.js';
import { AuthService } from '../server/services/auth.service.js';

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.substring(2);
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = 'true';
      }
    }
  }

  return result;
}

async function main() {
  const args = parseArgs();

  const mobile = args.mobile || process.env.ADMIN_MOBILE || '09121112233';
  const password = args.password || process.env.ADMIN_PASSWORD;
  const firstName = args.firstName || (args.name ? args.name.split(' ')[0] : 'علیرضا');
  const lastName = args.lastName || (args.name ? args.name.split(' ').slice(1).join(' ') : 'سفیدپور');
  const organizationName = args.org || 'هسته مرکزی پلتفرم دیدار';

  console.log('----------------------------------------------------');
  console.log(' Didar Gold Platform — Administrator Provisioning');
  console.log('----------------------------------------------------');

  if (!password) {
    console.error('[Error] Password is required. Specify via --password <secret> or ADMIN_PASSWORD env var.');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('[Error] Password must be at least 8 characters long.');
    process.exit(1);
  }

  try {
    await getDatabase();
    await runMigrations();

    const isAlreadyProvisioned = await AuthService.isAdministratorProvisioned();
    if (isAlreadyProvisioned && !args.force && !args.reset) {
      console.warn('[Warning] An administrator is already provisioned in the database.');
      console.warn('To reset or update administrator password, rerun with --force:');
      console.warn(`  npx tsx scripts/setup-admin.ts --mobile ${mobile} --password <new-password> --force`);
      await closeDatabase();
      process.exit(0);
    }

    if (isAlreadyProvisioned && (args.force || args.reset)) {
      console.log(`[Provisioning] Updating credentials for administrator: ${mobile}...`);
      const { k01Persons, authCredentials } = await import('../server/db/schema.js');
      const { eq } = await import('drizzle-orm');
      const db = (await getDatabase()) as any;
      const persons = await db.select().from(k01Persons).where(eq(k01Persons.mobile, mobile));
      const targetPartyId = persons.length > 0 ? persons[0].id : 'party-admin-001';
      const { hash, salt } = AuthService.hashPassword(password);
      await db
        .insert(authCredentials)
        .values({
          partyId: targetPartyId,
          passwordHash: hash,
          salt,
          status: 'active',
          failedAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: authCredentials.partyId,
          set: {
            passwordHash: hash,
            salt,
            status: 'active',
            failedAttempts: 0,
            lockedUntil: null,
            updatedAt: new Date(),
          },
        });
      console.log('✓ Administrator password updated successfully!');
      console.log('  Party ID:       ', targetPartyId);
      console.log('  Mobile:         ', mobile);
      console.log('----------------------------------------------------');
      await closeDatabase();
      process.exit(0);
    }

    console.log(`[Provisioning] Initializing administrator for mobile: ${mobile}...`);

    const result = await AuthService.provisionInitialAdministrator({
      firstName,
      lastName,
      mobile,
      password,
      organizationName,
    });

    console.log('✓ Initial Administrator provisioned successfully!');
    console.log('  Party ID:       ', result.session.partyId);
    console.log('  Full Name:      ', result.session.personName);
    console.log('  Mobile:         ', result.session.mobile);
    console.log('  Organization:   ', result.session.organizationName);
    console.log('  Assigned Roles: ', result.session.roleKeys.join(', '));
    console.log('  Session ID:     ', result.session.id);
    console.log('  Token Preview:  ', `${result.token.substring(0, 10)}...`);
    console.log('----------------------------------------------------');

    await closeDatabase();
    process.exit(0);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Fatal Error]:', msg);
    await closeDatabase().catch(() => {});
    process.exit(1);
  }
}

main();
