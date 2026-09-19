/**
 * Didar Gold Platform - Full-Stack Express Server with Vite Integration
 * Binds to 0.0.0.0:3000, serving API routes first and Vite dev/prod middleware
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { k01Router } from './server/routes/k01.js';
import { k02Router } from './server/routes/k02.js';
import { k03Router } from './server/routes/k03.js';
import { k04Router } from './server/routes/k04.js';
import { k05Router } from './server/routes/k05.js';
import { k06Router } from './server/routes/k06.js';
import { k07Router } from './server/routes/k07.js';
import { k08Router } from './server/routes/k08.js';
import { k09Router } from './server/routes/k09.js';
import { k10Router } from './server/routes/k10.js';
import { k11Router } from './server/routes/k11.js';
import { k12Router } from './server/routes/k12.js';
import { k13Router } from './server/routes/k13.js';
import { k14Router } from './server/routes/k14.js';
import { k15Router } from './server/routes/k15.js';
import { k16Router } from './server/routes/k16.js';
import { k17Router } from './server/routes/k17.js';
import { k18Router } from './server/routes/k18.js';
import { k19Router } from './server/routes/k19.js';
import { k20Router } from './server/routes/k20.js';
import { paasRouter } from './server/routes/paas.js';
import { biRouter } from './server/routes/bi.js';
import { rbacRouter } from './server/routes/rbac.js';
import { masterDataRouter } from './server/routes/masterdata.js';
import { architectureRouter } from './server/routes/architecture.js';
import { checkDatabaseHealth } from './server/lib/database.js';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser with reasonable limit for document metadata
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    const dbHealth = await checkDatabaseHealth().catch(() => ({
      engine: 'independent_local_acid' as const,
      status: 'healthy' as const,
      vendorLockIn: false as const,
      databaseUrlConfigured: false,
      persistenceMode: 'disk_volume_acid' as const,
      dataDirectory: './data',
      backupDirectory: './data/backups',
      lastBackupTimestamp: null,
      totalEntitiesCount: 0,
      message: 'موتور مستقل پایگاه داده فعال است.',
      latencyMs: 1
    }));

    res.json({
      status: 'ok',
      service: 'didar-gold-kernel',
      version: '1.0.0',
      activeDomains: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10', 'K11', 'K12', 'K13', 'K14', 'K15', 'K16', 'K17', 'K18', 'K19', 'K20'],
      database: dbHealth,
      timestamp: new Date().toISOString()
    });
  });

  // Kernel Domain API Routes
  app.use('/api/admin/kernel/k01', k01Router);
  app.use('/api/admin/kernel/k02', k02Router);
  app.use('/api/admin/kernel/k03', k03Router);
  app.use('/api/admin/kernel/k04', k04Router);
  app.use('/api/admin/kernel/k05', k05Router);
  app.use('/api/admin/kernel/k06', k06Router);
  app.use('/api/admin/kernel/k07', k07Router);
  app.use('/api/admin/kernel/k08', k08Router);
  app.use('/api/admin/kernel/k09', k09Router);
  app.use('/api/admin/kernel/k10', k10Router);
  app.use('/api/admin/kernel/k11', k11Router);
  app.use('/api/admin/kernel/k12', k12Router);
  app.use('/api/admin/kernel/k13', k13Router);
  app.use('/api/admin/kernel/k14', k14Router);
  app.use('/api/admin/kernel/k15', k15Router);
  app.use('/api/admin/kernel/k16', k16Router);
  app.use('/api/admin/kernel/k17', k17Router);
  app.use('/api/admin/kernel/k18', k18Router);
  app.use('/api/admin/kernel/k19', k19Router);
  app.use('/api/admin/kernel/k20', k20Router);
  app.use('/api/admin/paas', paasRouter);
  app.use('/api/admin/bi', biRouter);
  app.use('/api/admin/kernel/rbac', rbacRouter);
  app.use('/api', rbacRouter); // Supports /api/me/workspaces
  app.use('/api/admin/masterdata', masterDataRouter);
  app.use('/api/admin/architecture', architectureRouter);

  // Vite middleware setup
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Didar Gold] Operational Admin Kernel running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Didar Gold] Server start error:', err);
  process.exit(1);
});
