# Didar Gold Platform (سکوی تبادلات طلا و جواهر دیدار)

A production-grade, enterprise B2B platform for gold & jewelry trading, central workshop sourcing, physical vault custody, dual-currency subledger (Gold 750 + Fiat Toman), and role-based governance.

Designed for self-hosted execution on macOS and Linux servers with zero dependency on the Google AI Studio sandbox.

---

## Quick Start Guide

### 1. Running on Self-Hosted Server (Docker Compose)
```bash
# Copy environment configuration
cp .env.example .env

# Build and start services (App + PostgreSQL 16)
docker compose up -d --build

# Provision initial root administrator
docker compose exec didar-kernel npm run setup:admin -- --mobile 09121112233 --password "YourStrongPassword2026!" --name "علیرضا سفیدپور"

# Access application
open http://localhost:3000
```

### 2. Running Locally on macOS (Node.js 20+)
```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Apply database migrations
npm run db:migrate

# Start dual development server
npm run dev

# Provision administrator (or use Web UI on first visit)
npm run setup:admin -- --mobile 09121112233 --password "YourStrongPassword2026!" --name "علیرضا سفیدپور"
```

### 3. Running Automated Tests (Isolated Test Database)
```bash
npm test
```
*Note: Tests run against an isolated disposable database directory in `/tmp` and never mutate the active database or import demo records.*

---

## Documentation
- **[DEPLOYMENT.md](./DEPLOYMENT.md)**: Comprehensive deployment guide, Docker setup, backup/restore instructions, disaster recovery, and architecture separation.
- **[.env.example](./.env.example)**: Environment variable template without hard-coded secrets.
- **[server/db/migrations/](./server/db/migrations/)**: Versioned SQL migrations (`0000_slimy_hairball.sql`, `0001_auth_sessions.sql`, `0002_auth_credentials.sql`).

---

## Core Technologies
- **Runtime:** Node.js v22 LTS, Express v4, TypeScript v5
- **Database:** PostgreSQL 16 (Relational Drizzle ORM) + PGlite (Local Dev/Test)
- **Frontend:** React 19, Tailwind CSS v4, Lucide Icons, Vite 6
- **Architecture:** Multi-tier, quad-lingual (fa, ar, en, fr) with dynamic RTL/LTR support
