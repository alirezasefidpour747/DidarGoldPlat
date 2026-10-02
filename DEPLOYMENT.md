# Didar Gold Platform — Self-Hosted Deployment & Operations Guide
# Version: 2.0.0 | Architecture: Independent Multi-Tier Node.js + PostgreSQL

This guide provides end-to-end instructions for deploying and running the **Didar Gold Platform** independently on macOS, local Linux, or a dedicated cloud server. The exported application is 100% self-contained and operates with zero dependency on the Google AI Studio sandbox.

---

## 1. Architecture Overview & Environment Separation

| Feature | AI Studio Development Preview | Self-Hosted Production (Mac / Server) |
|---|---|---|
| **Database Engine** | Embedded PGlite (`./data/postgres`) | External Relational PostgreSQL 16 (`didar-db`) |
| **Server Ports** | Frontend on `3000`, Backend on `8001` (Vite reverse proxy) | Unified Express server on port `3000` (serving API + SPA) |
| **Process Manager** | `npm run dev` (running `scripts/dev.ts`) | Docker Compose (`docker compose up -d`) or `npm start` |
| **Authentication** | Bearer Tokens (`auth_sessions` in DB) | Bearer Tokens (`auth_sessions` in DB) |
| **SMS OTP Delivery** | Console simulation | Console simulation or live gateway (`SMS_API_KEY`) |
| **Data Persistence** | Volume mounted at `./data/postgres` | PostgreSQL Docker Volume `postgres_data` |

---

## 2. Prerequisites & System Requirements

### macOS (Local Development / Testing)
- macOS 12+ (Apple Silicon M1/M2/M3/M4 or Intel)
- Node.js 20.x or 22.x LTS (`node -v`)
- npm 10.x+ (`npm -v`)
- Docker Desktop for Mac (optional, if running PostgreSQL via Docker)

### Dedicated Server (Ubuntu 22.04 / 24.04 LTS / Debian 12)
- 2 vCPU, 4 GB RAM minimum
- Docker Engine 24+ and Docker Compose v2 (`docker compose version`)
- Ports 80 and 443 open for web traffic (via reverse proxy like Nginx or Caddy)
- Port 3000 accessible locally

---

## 3. Deployment Option A: Docker Compose (Recommended for Production)

This option spins up the bundled Didar application and a dedicated PostgreSQL 16 container with automatic healthchecks, persistent volumes, and versioned database migrations.

### Step 1: Clone or Copy Source Code
```bash
git clone https://github.com/your-org/didargoldplatform.git /opt/didar-gold
cd /opt/didar-gold
```

### Step 2: Configure Environment Variables
```bash
cp .env.example .env
```
Edit `.env` to set secure credentials:
```bash
nano .env
```
Key settings to configure:
```env
NODE_ENV=production
PORT=3000
SERVE_STATIC=true
DB_ENGINE=postgres
POSTGRES_USER=didar_user
POSTGRES_PASSWORD=your_secure_password_here
POSTGRES_DB=didar_gold_db
CORS_ALLOWED_ORIGIN=https://gold.yourdomain.ir
```

### Step 3: Build and Start Containers
```bash
docker compose up -d --build
```

### Step 4: Verify Container Health
```bash
docker compose ps
```
Both `didar_gold_kernel` and `didar_postgres_db` should display status `Up (healthy)`.

Check application logs:
```bash
docker compose logs -f didar-kernel
```
Expected output:
```text
[PostgreSQL] Connected to PostgreSQL server via connection pool (max: 10)
[Migration] Applying 0000_slimy_hairball.sql...
[Migration] Applying 0001_auth_sessions.sql...
[Migration] Applying 0002_auth_credentials.sql...
[Didar Gold Backend API] Running independently on http://0.0.0.0:3000
```

### Step 5: Test API Endpoint
```bash
curl http://localhost:3000/api/health
```

---

## 4. Deployment Option B: Native macOS Execution (Without Docker)

You can run the application directly on your Mac using Node.js and the built-in embedded PGlite engine or local PostgreSQL.

### Step 1: Install Dependencies
```bash
cd didargoldplatform
npm install
```

### Step 2: Configure Local Environment
```bash
cp .env.example .env
```
For native Mac development with embedded database:
```env
NODE_ENV=development
DB_ENGINE=pglite
PGDATA_DIR=./data/postgres
PORT=3000
BACKEND_PORT=8001
FRONTEND_PORT=3000
```

### Step 3: Run Database Migrations
```bash
npm run db:migrate
```

### Step 4: Start Development Dual Server
```bash
npm run dev
```
Open `http://localhost:3000` in Safari or Chrome.

---

## 5. Initial Administrator Setup Procedure

The platform does **not** create hard-coded or default demo accounts. The initial root administrator must be explicitly provisioned using one of the two methods below:

### Method 1: Via CLI (Recommended for System Administrators)
Run the provisioning command inside the project directory:
```bash
npm run setup:admin -- --mobile 09121112233 --password "YourStrongPassword2026!" --name "علیرضا سفیدپور"
```
Or inside a running Docker container:
```bash
docker compose exec didar-kernel npx tsx scripts/setup-admin.ts --mobile 09121112233 --password "YourStrongPassword2026!" --name "علیرضا سفیدپور"
```

Output:
```text
✓ Initial Administrator provisioned successfully!
  Party ID:        party-admin-001
  Full Name:       علیرضا سفیدپور
  Mobile:          09121112233
  Organization:    هسته مرکزی پلتفرم دیدار
  Assigned Roles:  governance.identity_access_manager
```

### Method 2: Via Web UI
1. Open `http://localhost:3000` (or your domain).
2. If no administrator exists, the web interface automatically presents the **«راه‌اندازی اولیه مدیر ارشد»** (Initial Admin Provisioning) form.
3. Fill in the administrator's First Name, Last Name, Mobile number, and a secure password (minimum 8 characters).
4. Click **«تکمیل و راه‌اندازی حساب مدیر ارشد»**.
5. The administrator credentials will be hashed using `scrypt` with a cryptographic salt, and the browser will be logged in immediately.

*Note: Once an administrator is provisioned, subsequent calls to `/api/auth/setup-admin` are locked and return `409 Conflict` (`ADMIN_ALREADY_PROVISIONED`).*

---

## 6. Daily Operations: Startup, Shutdown & Logs

### Startup
```bash
docker compose up -d
```

### Shutdown (Graceful Stop)
```bash
docker compose stop
```

### Full Teardown (Preserving Database Volumes)
```bash
docker compose down
```

### Viewing Real-Time Logs
```bash
# Application service logs
docker compose logs -f didar-kernel

# Database engine logs
docker compose logs -f didar-db
```

### Restarting the Services
```bash
docker compose restart
```

---

## 7. Database Backup & Disaster Recovery

### Step 1: Performing a Complete Database Backup (`pg_dump`)
To take an atomic SQL dump of all parties, organizations, memberships, RBAC roles, and authentication credentials:
```bash
# Create backups directory
mkdir -p ./backups

# Dump database from the PostgreSQL container
docker compose exec -t didar-db pg_dump -U didar_user -d didar_gold_db --clean --if-exists > ./backups/didar_backup_$(date +%Y%m%d_%H%M%S).sql
```

For native Mac installations with local PostgreSQL:
```bash
pg_dump -U didar_user -d didar_gold_db -F c -f ./backups/didar_backup_$(date +%Y%m%d_%H%M%S).dump
```

### Step 2: Restoring from a Backup (`psql` / `pg_restore`)
```bash
# Restore SQL dump into the running PostgreSQL container
docker compose exec -T didar-db psql -U didar_user -d didar_gold_db < ./backups/didar_backup_YYYYMMDD_HHMMSS.sql
```

---

## 8. Versioned Database Migrations

Database schema evolutions are versioned as SQL scripts under `server/db/migrations/`:
- `0000_slimy_hairball.sql`: Core K01 Parties, Organizations, Memberships, Documents, and RBAC tables.
- `0001_auth_sessions.sql`: Cryptographic session tokens and authentication metadata.
- `0002_auth_credentials.sql`: Password hashes, salts, and SMS OTP verification records.

Migrations are applied automatically whenever the application boots up. To apply them manually at any time:
```bash
npm run db:migrate
```

---

## 9. Running Tests with Database Isolation

The test suite runs strictly against an **isolated disposable database directory** in `/tmp` and refuses to target the active development database (`data/postgres`). It does not import legacy demo records.

To execute the test suite:
```bash
npm test
```

Expected result:
```text
✓ tests/persistence.test.ts (17 tests)
  ✓ 1. should execute migrations cleanly on isolated disposable database
  ✓ 2. should fail with clear fatal error in production mode when external PostgreSQL is missing
  ✓ 3. should refuse to target the active development database in test mode
  ✓ 4. should verify database health using real SELECT 1 without exposing credentials
  ✓ 5. should seed canonical RBAC role catalog into isolated test database
  ✓ 6. should provision initial administrator without hardcoded credentials
  ✓ 7. should refuse subsequent administrator provisioning with 409 Conflict
  ✓ 8. should reject unauthenticated requests to protected endpoints with 401 Unauthorized
  ✓ 9. should reject invalid or forged session tokens with 401 Unauthorized
  ✓ 10. should reject login attempts with invalid password with 401
  ✓ 11. should login successfully with valid credentials and return server-derived session
  ✓ 12. should allow authenticated admin to access protected endpoints
  ✓ 13. should create retailer fixtures and allow retailer login
  ✓ 14. should deny Retailer from accessing or mutating resources of another organization with 403
  ✓ 15. should automatically scope query results to retailer authorized organization
  ✓ 16. should revoke session on logout and deny subsequent access with 401
  ✓ 17. should verify persistence of credentials and roles across connection teardown & reinitialization
```

---

## 10. External Services & Required Credentials

| Service | Necessity | Default / Fallback | Configuration |
|---|---|---|---|
| **PostgreSQL 16** | **Mandatory in Production** | Handled automatically by `didar-db` in Docker Compose | Set `DATABASE_URL` in `.env` |
| **SMS Aggregator** (e.g. Kavenegar) | Optional | Prints 6-digit OTP code to server console | Set `SMS_API_KEY` in `.env` |
| **Google Gemini API** | Optional | Unused if AI Copilot is disabled | Set `GEMINI_API_KEY` in `.env` |
| **AI Studio Sandbox** | **Not Required** | Completely decoupled; runs natively on Mac or standard Linux | N/A |
