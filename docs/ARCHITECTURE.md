# Architecture

## Overview

NepseWrite is a full-stack web application built on **Next.js 15.5 App Router**. The public-facing site serves Nepal stock market educational content; a password-protected admin panel lets the owner write and manage articles.

```
Browser
  │
  ▼
Next.js App (Docker, port 3000)
  ├── Public routes  /  /blog  /blog/[slug]  /terms
  ├── Auth routes    /login  /setup
  ├── Admin routes   /admin/**  (requires session cookie)
  └── API routes     /api/nepse  /api/auth/**
          │
          ▼
     PostgreSQL 16 (Docker, port 5432 internal / 5433 host)
          6 tables — see DATABASE.md

     Resend (external)     — transactional email (2FA OTP)
     merolagani.com (external) — live NEPSE market data
```

---

## Folder Structure

```
blog-site/
├── docker-compose.yml        — defines app + db containers
├── Dockerfile                — Node 20 image, dev server
├── next.config.ts            — serverExternalPackages, WATCHPACK_POLLING
├── .env.example              — template for required secrets
│
├── src/
│   ├── app/                  — Next.js App Router pages & layouts
│   │   ├── layout.tsx        — Root layout: ThemeProvider + DisclaimerGate
│   │   ├── globals.css       — Tailwind v4 + CSS custom property theme tokens
│   │   ├── page.tsx          — Home page
│   │   ├── blog/
│   │   │   ├── page.tsx      — Blog listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx  — Individual post
│   │   ├── terms/
│   │   │   └── page.tsx      — Terms & disclaimer
│   │   ├── (auth)/
│   │   │   ├── login/        — 2-step login (password → OTP)
│   │   │   └── setup/        — First-time admin account creation
│   │   ├── admin/
│   │   │   ├── layout.tsx    — Protected layout with sidebar
│   │   │   ├── page.tsx      — Dashboard (stats + recent articles)
│   │   │   ├── posts/        — Article list + editor
│   │   │   ├── categories/   — Category CRUD
│   │   │   ├── pages/        — Page builder (block-based)
│   │   │   └── settings/     — Site settings
│   │   └── api/
│   │       ├── auth/         — Auth.js handler + /send-otp route
│   │       └── nepse/        — Proxy to merolagani.com
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── auth.ts       — Full Auth.js config (Node, DB, bcrypt)
│   │   │   └── config.ts     — Edge-safe config (middleware only)
│   │   ├── db/
│   │   │   ├── index.ts      — Drizzle client (pg pool)
│   │   │   └── schema.ts     — All table definitions
│   │   ├── email/
│   │   │   └── index.ts      — Resend utility (lazy init)
│   │   └── actions/
│   │       ├── posts.ts      — Server Actions: create/update/delete/publish
│   │       ├── categories.ts — Server Actions: category CRUD
│   │       └── pages.ts      — Server Actions: page + block CRUD
│   │
│   ├── components/
│   │   ├── ThemeProvider.tsx — React context, localStorage persistence
│   │   ├── ThemeToggle.tsx   — Sun/Moon button
│   │   ├── DisclaimerGate.tsx— Full-screen risk modal (first visit)
│   │   ├── layout/
│   │   │   ├── SiteHeader.tsx    — Public nav + NEPSE ticker
│   │   │   ├── SiteFooter.tsx    — Newsletter + links
│   │   │   └── NepseTickerStrip.tsx — Live scrolling stock ticker
│   │   └── editor/
│   │       └── TiptapEditor.tsx  — Rich text editor with YouTube support
│   │
│   └── middleware.ts         — Route protection (uses Edge-safe config)
│
└── docs/                     — This documentation
```

---

## Request Lifecycle

### Public page (e.g. `/blog/my-article`)

```
1. Request hits Next.js edge middleware
2. middleware.ts: no auth required → pass through
3. Server Component renders → queries DB directly via Drizzle
4. HTML streamed to browser
5. Client components hydrate (ThemeProvider reads localStorage)
```

### Admin page (e.g. `/admin/posts`)

```
1. Request hits middleware
2. middleware.ts checks for session JWT cookie
3. No session → redirect to /login
4. Valid session → admin layout + page Server Components render
5. DB queries run on server
6. Client components (tables, editors) hydrate in browser
```

### API: Live NEPSE data (`/api/nepse`)

```
1. Client (NepseTickerStrip) fetches /api/nepse every 5 minutes
2. Route handler checks in-memory cache (5 min TTL)
3. On cache miss: fetches merolagani.com market_summary endpoint
4. Parses turnover.detail → top 12 stocks
5. Returns JSON: { stocks: [{ symbol, label, price, change, up }] }
```

### Login flow (2FA)

See [AUTH.md](AUTH.md) for full diagram.

---

## React Server Components vs Client Components

| Type | Where used | Can access DB? | Has interactivity? |
|---|---|---|---|
| Server Component | Layouts, page shells, data fetching | Yes | No |
| Client Component | Tables, forms, editors, theme toggle | No | Yes |
| Server Action | `lib/actions/*.ts` | Yes | Called from client |

**Key rule**: A Server Component cannot pass functions or class instances as props to a Client Component. The admin nav (NavLink.tsx) owns its own route array with icon components for this reason.

---

## Environment Split

Auth.js requires two config files because **Next.js middleware runs on the Edge runtime** (no Node.js built-ins), but the Credentials provider needs `bcryptjs` and `pg` (Node.js only):

| File | Runtime | What it does |
|---|---|---|
| `src/lib/auth/config.ts` | Edge | Session strategy, JWT callbacks, route protection helpers |
| `src/lib/auth/auth.ts` | Node.js | Credentials provider, DB queries, password/OTP verification |
| `src/middleware.ts` | Edge | Imports `config.ts` only |
| `src/app/api/auth/[...nextauth]/route.ts` | Node.js | Imports `auth.ts` |
