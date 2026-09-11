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
import { checkSupabaseHealth } from './server/lib/supabase.js';
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
    const supabaseHealth = await checkSupabaseHealth().catch(() => ({
      configured: false,
      status: 'unreachable' as const,
      message: 'بررسی وضعیت مقدور نبود.'
    }));

    res.json({
      status: 'ok',
      service: 'didar-gold-kernel',
      version: '1.0.0',
      activeDomains: ['K01', 'K02', 'K03', 'K04', 'K05', 'K06', 'K07', 'K08', 'K09', 'K10'],
      supabase: supabaseHealth,
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
