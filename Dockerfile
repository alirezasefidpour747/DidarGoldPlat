# ==============================================================================
# Didar Gold Platform - Production Dockerfile
# Multi-stage build for ultra-lightweight, high-performance independent deployment
# ==============================================================================

# Stage 1: Build Frontend and Server
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package descriptors
COPY package.json ./

# Install all dependencies for build
RUN npm install

# Copy source code and configurations
COPY tsconfig.json vite.config.ts index.html metadata.json ./
COPY src/ ./src/
COPY server/ ./server/
COPY server.ts ./

# Build client SPA and bundle server to dist/server.cjs
RUN npm run build

# Stage 2: Minimal Production Image
FROM node:22-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy built distribution artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Install only production dependencies (express, dotenv, etc.)
RUN npm install --omit=dev --ignore-scripts

# Create persistent data directory for transactional store & backups
RUN mkdir -p /app/data /app/data/backups

# Expose server port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/api/health || exit 1

# Start the bundled Express + Vite static server
CMD ["node", "dist/server.cjs"]
