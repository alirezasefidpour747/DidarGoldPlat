# ==============================================================================
# Didar Gold Platform - Production Dockerfile
# Multi-stage build for ultra-lightweight, high-performance independent deployment
# ==============================================================================

# Stage 1: Build Frontend and Server
FROM oven/bun:1.4.2-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json bun.lock ./

# Install all dependencies for build
RUN bun install --frozen-lockfile

# Copy source code and configurations
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY src/ ./src/
COPY server/ ./server/
COPY scripts/ ./scripts/
COPY drizzle/ ./drizzle/
COPY drizzle.config.ts ./
COPY server.ts ./

# Build client SPA and bundle server to dist/server.cjs
RUN bun run build

# Stage 2: Minimal Production Image
FROM oven/bun:1.4.2-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV BACKEND_PORT=3000
ENV SERVE_STATIC=true

# Copy built distribution artifacts
COPY --from=builder --chown=bun:bun /app/dist ./dist
COPY --from=builder --chown=bun:bun /app/package.json /app/bun.lock ./
COPY --from=builder --chown=bun:bun /app/drizzle ./drizzle
COPY --from=builder --chown=bun:bun /app/scripts ./scripts
COPY --from=builder --chown=bun:bun /app/server ./server
COPY --from=builder --chown=bun:bun /app/src/types ./src/types

# Install only production dependencies (express, dotenv, etc.)
RUN bun install --frozen-lockfile --production --ignore-scripts

# K02-K20 still use the legacy data mount; K01 imports use a separate backup path.
RUN mkdir -p /app/data /app/data/backups /app/data/import-backups && chown -R bun:bun /app

USER bun

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD bun -e "const r=await fetch('http://127.0.0.1:3000/api/health/live');process.exit(r.ok?0:1)" || exit 1

# Start the bundled Express + Vite static server
CMD ["bun", "dist/server.cjs"]
