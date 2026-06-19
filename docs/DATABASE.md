# Database

## Connection

PostgreSQL 16 runs in a Docker container named `db`.

| Setting | Value |
|---|---|
| Host (inside Docker) | `db` |
| Host (from your machine) | `localhost:5433` |
| Database name | `nepsewrite` |
| User | `postgres` |
| Password | `postgres` |
| Full connection string | `postgresql://postgres:postgres@db:5432/nepsewrite` |

The connection string is set in `docker-compose.yml` as `DATABASE_URL`. You do not need to put it in `.env` for local dev.

---

## Schema at a Glance

Six tables live in `src/lib/db/schema.ts`:

| Table | Purpose |
|---|---|
| `admin_users` | Admin accounts (one row typically) |
| `otp_tokens` | Short-lived 2FA codes (linked to admin_users) |
| `posts` | Blog articles |
| `categories` | Post categories |
| `pages` | Page-builder pages |
| `newsletter_subscribers` | Newsletter email addresses |

---

## Table Definitions

### `admin_users`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key, `gen_random_uuid()` |
| name | text | Display name |
| email | text | Unique — used for login + OTP delivery |
| passwordHash | text | bcrypt hash (12 rounds) |
| createdAt | timestamp | Auto-set on insert |

### `otp_tokens`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| adminUserId | uuid | FK → admin_users.id (cascade delete) |
| tokenHash | text | bcrypt hash of the 6-digit OTP (10 rounds) |
| expiresAt | timestamp | Now + 10 minutes when created |
| used | boolean | Flipped to `true` after first successful use |
| createdAt | timestamp | Auto-set on insert |

Tokens are never deleted automatically. A cleanup cron is not implemented — old rows accumulate but are harmless because expired/used tokens are rejected.

### `posts`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | Article title |
| slug | text | URL-safe unique identifier, e.g. `what-is-nepse` |
| excerpt | text | Short summary shown in listings |
| category | text | Category name (denormalised string, not FK) |
| content | text | HTML from Tiptap editor |
| published | boolean | `false` = draft. Only published posts show publicly |
| viewCount | integer | Incremented server-side on each post visit |
| createdAt | timestamp | Auto-set |
| updatedAt | timestamp | Updated on save |

> **Note**: `category` stores the category **name** as a plain string, not a UUID. This is intentional for simplicity — renaming a category does not update posts. If you rename a category, update posts manually.

### `categories`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| name | text | Display name, e.g. `IPO/FPO` |
| slug | text | URL-safe unique, e.g. `ipo-fpo` |
| color | text | Hex color for the badge, default `#00FF88` |
| description | text | Optional |
| createdAt | timestamp | Auto-set |

### `pages`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| title | text | Page title |
| slug | text | URL path, e.g. `about` → `/about` |
| blocks | text | JSON array of block objects (see ADMIN.md) |
| published | boolean | Draft by default |
| updatedAt | timestamp | Updated on save |

### `newsletter_subscribers`

| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| email | text | Unique subscriber email |
| subscribedAt | timestamp | Auto-set |

---

## Drizzle ORM

NepseWrite uses [Drizzle ORM](https://orm.drizzle.team/) — a TypeScript-first ORM with zero runtime magic.

### Running queries

```typescript
import { db } from '@/lib/db'
import { posts } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'

// Select
const allPosts = await db.select().from(posts).orderBy(desc(posts.createdAt))

// Filter
const post = await db.query.posts.findFirst({
  where: eq(posts.slug, 'my-article')
})

// Insert
await db.insert(posts).values({ title: 'New Article', slug: 'new-article', ... })

// Update
await db.update(posts).set({ published: true }).where(eq(posts.id, id))

// Delete
await db.delete(posts).where(eq(posts.id, id))
```

### Schema changes (migrations)

NepseWrite uses **schema push** (not migration files). This means Drizzle reads the schema and issues `ALTER TABLE` or `CREATE TABLE` SQL directly.

```bash
# Apply schema changes to the running database
docker compose exec app npm run db:push
```

**Warning**: `db:push` can drop columns that you remove from the schema. On production, review what changes it will make before confirming. For destructive changes, back up the database first.

### Drizzle Studio (visual DB browser)

```bash
docker compose exec app npm run db:studio
# Opens at http://localhost:4983
```

---

## Backup & Restore

```bash
# Dump the database to a file on your machine
docker compose exec db pg_dump -U postgres nepsewrite > backup.sql

# Restore from a dump
cat backup.sql | docker compose exec -T db psql -U postgres nepsewrite
```
