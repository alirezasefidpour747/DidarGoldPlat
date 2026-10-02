/**
 * Didar Gold Platform - Dedicated Backend API Service
 * Binds to 0.0.0.0:8000 (configurable via BACKEND_PORT or PORT),
 * providing RESTful API routes under /api with robust CORS governance.
 */

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
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
import { checkRuntimeReadiness } from './server/lib/database.js';
import { closeDatabasePool } from './server/database/client.js';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.BACKEND_PORT || process.env.PORT || 8000);
  const isProduction = process.env.NODE_ENV === 'production';
  const serveStatic = process.env.SERVE_STATIC === 'true';
  const configuredCorsOrigins = process.env.CORS_ALLOWED_ORIGINS;
  const defaultDevelopmentOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://0.0.0.0:3000'
  ];

  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error('Configuration error: PORT/BACKEND_PORT must be an integer from 1 to 65535.');
  }

  if (isProduction) {
    const missing = [
      !process.env.DATABASE_URL?.trim() && 'DATABASE_URL',
      !configuredCorsOrigins?.trim() && 'CORS_ALLOWED_ORIGINS',
      !['true', 'false'].includes(process.env.SERVE_STATIC || '') && 'SERVE_STATIC'
    ].filter(Boolean);
    if (missing.length > 0) {
      throw new Error(`Configuration error: missing required production settings: ${missing.join(', ')}`);
    }
  }

  const allowedOrigins = (configuredCorsOrigins || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  if (!isProduction) allowedOrigins.push(...defaultDevelopmentOrigins);

  for (const origin of allowedOrigins) {
    if (origin === '*') {
      throw new Error('Configuration error: wildcard CORS origins are not allowed.');
    }
    try {
      const parsed = new URL(origin);
      if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
        throw new Error('invalid origin');
      }
    } catch {
      throw new Error('Configuration error: CORS_ALLOWED_ORIGINS must contain exact HTTP(S) origins without paths.');
    }
  }
  const exactAllowedOrigins = new Set(allowedOrigins);

  // Strict CORS configuration
  app.use(
    cors({
      origin: (origin, callback) => {
        // Permit server-to-server, curl, or same-origin (no Origin header)
        if (!origin) return callback(null, true);

        if (exactAllowedOrigins.has(origin)) return callback(null, true);

        const error = new Error('Browser origin is not allowed by CORS policy.') as Error & {
          status?: number;
        };
        error.status = 403;
        return callback(error);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
    })
  );

  // JSON Body Parser with reasonable limit for document metadata
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  const sendLiveness = (_req: express.Request, res: express.Response) => {
    res.json({ status: 'alive', service: 'didar-gold-backend-api' });
  };

  // Compatibility alias: /api/health intentionally has liveness semantics.
  app.get('/api/health', sendLiveness);
  app.get('/api/health/live', sendLiveness);

  app.get('/api/health/ready', async (_req, res) => {
    try {
      const readiness = await checkRuntimeReadiness();
      res.status(readiness.ready ? 200 : 503).json({
        status: readiness.ready ? 'ready' : 'not_ready',
        dependencies: readiness.dependencies
      });
    } catch {
      res.status(503).json({
        status: 'not_ready',
        dependencies: { runtime: 'unavailable' }
      });
    }
  });

  // Kernel Domain API Routes (Requirement 2 & 5)
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

  // Standalone fallback: if SERVE_STATIC is explicitly enabled, serve static assets
  if (serveStatic) {
    const distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      throw new Error('Configuration error: SERVE_STATIC=true but dist/index.html is missing.');
    }
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.use((err: Error & { status?: number }, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    const status = err.status || 500;
    res.status(status).json({
      status: 'error',
      message: status === 403 ? 'Browser origin is not allowed.' : 'Internal server error.'
    });
  });

  const server = app.listen(PORT, '0.0.0.0');

  server.on('error', (err: any) => {
    const reason = err.code === 'EADDRINUSE' ? 'configured port is already in use' : 'listener failure';
    console.error(`[Didar Gold Backend API] Startup failed on 0.0.0.0:${PORT}: ${reason}.`);
    process.exit(1);
  });

  server.on('listening', () => {
    console.log(`[Didar Gold Backend API] Listening on http://0.0.0.0:${PORT}`);
    console.log(`[Didar Gold Backend API] Browser CORS allowlist entries: ${exactAllowedOrigins.size}`);
    console.warn('[Didar Gold Backend API] Production release remains frozen: authentication and RBAC enforcement are not implemented.');
  });

  let shuttingDown = false;
  const shutdown = (signal: string) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`[Didar Gold Backend API] ${signal} received; closing HTTP and PostgreSQL pools.`);
    const forceExit = setTimeout(() => process.exit(1), 10_000);
    forceExit.unref();
    server.close(async () => {
      try {
        await closeDatabasePool();
        process.exit(0);
      } catch {
        console.error('[Didar Gold Backend API] PostgreSQL pool shutdown failed.');
        process.exit(1);
      }
    });
  };
  process.once('SIGTERM', () => shutdown('SIGTERM'));
  process.once('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  console.error('[Didar Gold Backend API] Server start error:', err);
  process.exit(1);
});
