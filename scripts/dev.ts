/**
 * Didar Gold Platform - Multi-Service Development Runner
 * Concurrently executes:
 * 1. Backend API Service on the explicitly configured backend port
 * 2. Frontend UI Service (Vite) on http://0.0.0.0:3000
 * 
 * Manages child process lifecycle, stream coloring, and graceful shutdown.
 */

import { spawn, ChildProcess } from 'child_process';

const FRONTEND_PORT = process.env.FRONTEND_PORT || '3000';
const children: ChildProcess[] = [];

async function main() {
  const backendPort = Number(process.env.BACKEND_PORT || process.env.PORT || 8000);
  if (!Number.isInteger(backendPort) || backendPort < 1 || backendPort > 65535) {
    throw new Error('Configuration error: PORT/BACKEND_PORT must be an integer from 1 to 65535.');
  }

  const backendPortStr = String(backendPort);
  const backendUrl = `http://127.0.0.1:${backendPortStr}`;

  console.log('------------------------------------------------------------');
  console.log('🚀 [Didar Gold] Starting Dual-Service Microarchitecture');
  console.log(`📡 Backend API Service: http://0.0.0.0:${backendPortStr}`);
  console.log(`💻 Frontend UI Service:  http://0.0.0.0:${FRONTEND_PORT}`);
  console.log(`🔗 API Base URL:         ${backendUrl}`);
  console.log('------------------------------------------------------------\n');

  function startBackend(): ChildProcess {
    const backendEnv = {
      ...process.env,
      PORT: backendPortStr,
      BACKEND_PORT: backendPortStr,
      NODE_ENV: process.env.NODE_ENV || 'development',
      CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS || `http://localhost:${FRONTEND_PORT}`,
    };

    const proc = spawn('bunx', ['tsx', 'server.ts'], {
      env: backendEnv,
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line) console.log(`\x1b[36m[BACKEND :${backendPortStr}]\x1b[0m ${line}`);
      }
    });

    proc.stderr?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line) console.error(`\x1b[31m[BACKEND :${backendPortStr} ERR]\x1b[0m ${line}`);
      }
    });

    proc.on('exit', (code) => {
      console.log(`\x1b[33m[BACKEND :${backendPortStr}] Exited with code ${code}\x1b[0m`);
    });

    return proc;
  }

  function startFrontend(): ChildProcess {
    const frontendEnv = {
      ...process.env,
      FRONTEND_PORT: FRONTEND_PORT,
      VITE_API_BASE_URL: backendUrl,
    };

    const proc = spawn('bunx', ['vite', '--port', FRONTEND_PORT, '--host', '0.0.0.0'], {
      env: frontendEnv,
      shell: true,
      stdio: ['inherit', 'pipe', 'pipe']
    });

    proc.stdout?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line) console.log(`\x1b[32m[FRONTEND:${FRONTEND_PORT}]\x1b[0m ${line}`);
      }
    });

    proc.stderr?.on('data', (data) => {
      const lines = data.toString().trim().split('\n');
      for (const line of lines) {
        if (line) console.error(`\x1b[31m[FRONTEND:${FRONTEND_PORT} ERR]\x1b[0m ${line}`);
      }
    });

    proc.on('exit', (code) => {
      console.log(`\x1b[33m[FRONTEND:${FRONTEND_PORT}] Exited with code ${code}\x1b[0m`);
    });

    return proc;
  }

  const backendProc = startBackend();
  children.push(backendProc);

  // Allow backend service to spin up and bind before launching Vite frontend
  setTimeout(() => {
    const frontendProc = startFrontend();
    children.push(frontendProc);
  }, 600);
}

function cleanup() {
  console.log('\n🛑 [Didar Gold] Shutting down all services gracefully...');
  for (const child of children) {
    if (child && !child.killed) {
      try {
        child.kill('SIGTERM');
      } catch (e) {
        // ignore
      }
    }
  }
  process.exit(0);
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

main().catch((err) => {
  console.error('[Didar Gold Runner] Fatal startup error:', err);
  process.exit(1);
});
