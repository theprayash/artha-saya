# NepseWrite — Technical Documentation

> Nepal's share market blog platform. Educational content about NEPSE for young Nepali investors.

---

## Quick Links

| Document | Purpose |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | First-time setup & running locally |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design & folder structure |
| [docs/DATABASE.md](docs/DATABASE.md) | Schema, migrations, Drizzle ORM |
| [docs/AUTH.md](docs/AUTH.md) | Authentication & 2FA flow |
| [docs/ADMIN.md](docs/ADMIN.md) | Admin panel features & usage |
| [docs/COMPONENTS.md](docs/COMPONENTS.md) | UI components & block system |
| [docs/API.md](docs/API.md) | API routes reference |
| [docs/THEME.md](docs/THEME.md) | Dark / light theme system |
| [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) | Production deployment guide |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common bugs & fixes |

---

## Tech Stack at a Glance

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5 (App Router, React Server Components) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 + CSS custom properties |
| Database | PostgreSQL 16 (Docker) |
| ORM | Drizzle ORM |
| Auth | Auth.js v5 (next-auth@5 beta) |
| Rich Text Editor | Tiptap v2 |
| Email | Resend |
| Drag & Drop | @dnd-kit |
| Infrastructure | Docker + Docker Compose |
| Market Data | merolagani.com API (proxied) |

---

## One-command start

```bash
# 1. Clone and enter the project
cd blog-site

# 2. Copy environment file
cp .env.example .env
# Edit .env and fill in RESEND_API_KEY, NEXTAUTH_SECRET

# 3. Start everything
docker compose up -d

# 4. Open browser
open http://localhost:3000/setup   # create the first admin account
```

See [docs/SETUP.md](docs/SETUP.md) for full setup instructions.
