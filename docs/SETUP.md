# Setup Guide

## Prerequisites

| Tool | Minimum Version | Install |
|---|---|---|
| Docker Desktop | 24+ | https://docs.docker.com/get-docker/ |
| Docker Compose | v2 (bundled with Docker Desktop) | — |
| Git | any | https://git-scm.com/ |

> **No Node.js install needed on your machine.** Everything runs inside Docker.

---

## Step 1 — Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
# Required — generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your-random-secret-here

# Required for 2FA login emails — get free key at resend.com
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Optional — your verified sender domain in Resend
# Falls back to onboarding@resend.dev (Resend test address) if not set
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

> **DATABASE_URL, NEXTAUTH_URL** are already set correctly in `docker-compose.yml` for local dev.
> You do NOT need to put them in `.env` unless overriding for production.

---

## Step 2 — Start the stack

```bash
docker compose up -d
```

This starts two containers:

| Container | What it does |
|---|---|
| `app` | Next.js dev server on port 3000 |
| `db` | PostgreSQL 16 on port 5433 (host) / 5432 (internal) |

The `app` container automatically:
1. Waits for the database to be ready (`pg_isready` health check)
2. Runs `drizzle-kit push` to create all tables
3. Starts `next dev` with hot-reload

---

## Step 3 — Create the first admin account

Visit **http://localhost:3000/setup** in your browser.

Fill in your name, email, and password. This page locks automatically after the first admin is created — it will return 404 for any subsequent visits.

---

## Step 4 — Log in

Visit **http://localhost:3000/login**

**Login flow (2-step):**
1. Enter your email and password → click **Continue**
2. A 6-digit OTP is sent to your email (via Resend)
3. Enter the OTP → you are logged in

**Development without Resend configured:**  
If `RESEND_API_KEY` is not set, the OTP is printed in the Docker logs AND shown as an amber box on the login screen. This is dev-only behaviour — it is disabled in production.

```bash
# See the OTP in dev mode
docker compose logs app -f | grep "OTP"
```

---

## Common Dev Commands

```bash
# Start everything
docker compose up -d

# Stop everything
docker compose down

# View live logs
docker compose logs app -f

# Rebuild after package.json changes
docker compose up -d --build

# Open a shell inside the app container
docker compose exec app sh

# Push schema changes to DB
docker compose exec app npm run db:push

# Open Drizzle Studio (DB browser) at http://localhost:4983
docker compose exec app npm run db:studio

# Install a new npm package
docker compose exec app npm install <package-name>

# TypeScript type-check
docker compose exec app npx tsc --noEmit
```

---

## Port Reference

| Port | Service |
|---|---|
| 3000 | NepseWrite web app |
| 4983 | Drizzle Studio (DB browser) |
| 5433 | PostgreSQL (host access) |

> PostgreSQL is on port **5433** on your machine (not 5432) because 5432 was already in use.
> Inside Docker network, it is still 5432 (DATABASE_URL uses `:5432`).
