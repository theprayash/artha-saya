# Troubleshooting

A reference for bugs that have occurred and how to fix them, plus common failure patterns.

---

## Quick Diagnostics

```bash
# Check container status
docker compose ps

# Live app logs (most useful first stop)
docker compose logs app -f

# Live DB logs
docker compose logs db -f

# TypeScript type errors
docker compose exec app npx tsc --noEmit

# Restart the app container (without losing DB data)
docker compose restart app
```

---

## Login / Authentication

### "OTP not received"

**Cause A**: `RESEND_API_KEY` is not set.  
**Fix**: Add it to `.env` and restart: `docker compose restart app`

**Cause B**: Sender domain not verified in Resend.  
**Fix**: Go to Resend dashboard → Domains → verify your domain.

**Cause C**: Email went to spam.  
**Fix**: Check spam folder. Add the sender to contacts. In Resend, configure DMARC/DKIM.

**Dev workaround**: When `RESEND_API_KEY` is not set and `NODE_ENV=development`, the OTP appears in logs and on the login screen as an amber banner:
```bash
docker compose logs app -f | grep "OTP"
```

---

### "Invalid credentials" on correct password

**Cause**: The `admin_users.passwordHash` in the database doesn't match what you expect.  
**Fix**: Reset the password hash:
```bash
# Generate a new hash
docker compose exec app node -e "const b=require('bcryptjs'); b.hash('your-new-password',12).then(console.log)"

# Apply it (use Drizzle Studio or psql)
docker compose exec db psql -U postgres nepsewrite -c "UPDATE admin_users SET password_hash='PASTE_HASH_HERE' WHERE email='your@email.com';"
```

---

### Session expires immediately / can't stay logged in

**Cause**: `NEXTAUTH_SECRET` changed between restarts, or is missing.  
**Fix**: Ensure `NEXTAUTH_SECRET` is set in `.env` and does not change between restarts. It must match what was used to sign the existing JWT cookies.

---

### "Functions cannot be passed directly to Client Components"

**When**: You see this error in the admin layout.  
**Cause**: A Server Component is passing a React component (like a Lucide icon) as a prop to a Client Component.  
**Fix**: Move the prop definition (including any functions or component references) into the Client Component itself. The admin sidebar (`NavLink.tsx`) already defines its own route array with icons for this reason.

---

## Database

### Container starts but DB tables don't exist

**Cause**: `drizzle-kit push` failed silently on startup.  
**Fix**:
```bash
docker compose exec app npm run db:push
```
Watch for errors in the output. Common cause: `DATABASE_URL` not set correctly.

---

### `db:push` asks "Are you sure?" and hangs

**Cause**: An interactive prompt appeared in a non-interactive shell.  
**Fix**: Run it in an interactive session:
```bash
docker compose exec -it app npm run db:push
```
Or pass `--force` to skip the confirmation (only safe on dev data):
```bash
docker compose exec app npx drizzle-kit push --force
```

---

### PostgreSQL "FATAL: role postgres does not exist"

**Cause**: The `db` container data volume has corrupted or conflicting data from a previous install.  
**Fix** (destroys all data — back up first):
```bash
docker compose down -v   # -v removes named volumes
docker compose up -d
```

---

### "too many clients" PostgreSQL error

**Cause**: The connection pool is exhausted.  
**Fix**: Check `src/lib/db/index.ts` — the pool `max` should be 10 or lower for a small VPS. Also check for connection leaks (un-awaited queries, missing try/finally).

---

## NEPSE Ticker

### Ticker shows "Live data unavailable"

**Cause A**: merolagani.com API endpoint changed or is temporarily down.  
**Fix**: Check `/api/nepse` response in browser DevTools. Look for the upstream URL in `src/app/api/nepse/route.ts` and test it manually with `curl`.

**Cause B**: merolagani.com blocked the server's IP.  
**Fix**: Try accessing from a different IP. Consider adding a User-Agent header to the upstream fetch to look more like a browser.

---

### Ticker text overlaps the "LIVE · time" badge

**This was a past bug** (already fixed).  
**Symptom**: The scrolling stock names disappear behind or overlap the static time pill on the left.  
**Fix**: The `NepseTickerStrip` layout must be a flex row:
- Left: static pill with `border-right`, fixed width
- Right: `flex-1 overflow-hidden` div containing the scrolling marquee

Check that no `absolute` positioning is used for the time badge.

---

## Theme System

### Light theme shows pure black/white instead of warm colours

**Cause**: The component is using hardcoded Tailwind colours instead of CSS variables.  
**Fix**: Replace any hardcoded `bg-white`, `text-black`, `bg-[#0A0A0A]` etc. with `style={{ background: 'var(--bg)', color: 'var(--text)' }}`.

---

### Theme flashes from dark to light on page load

**Cause**: `ThemeProvider` reads `localStorage` in a `useEffect`, so the server renders dark, then the client switches. This flash is unavoidable without server-side session storage.  
**Workaround** (if it becomes a serious UX problem): inject a `<script>` tag in `<head>` that sets `data-theme` before the page renders. This requires a synchronous script (not a module).

---

## Editor (Tiptap)

### "window is not defined" or SSR error from TiptapEditor

**Cause**: TiptapEditor is being server-rendered.  
**Fix**: Import it with `dynamic` and `ssr: false`:
```typescript
const TiptapEditor = dynamic(
  () => import('@/components/editor/TiptapEditor'),
  { ssr: false }
)
```

---

### YouTube embed doesn't appear

**Cause A**: YouTube URL format not recognised.  
**Fix**: Use the full `https://www.youtube.com/watch?v=...` format. Short links (`youtu.be/...`) may need the `allowFullscreen` attribute to be passed in the `Youtube` extension config.

**Cause B**: The `Youtube` Tiptap extension is not in the extensions list.  
**Check**: Open `TiptapEditor.tsx` and verify `Youtube` is in the `extensions` array.

---

## TypeScript Errors

### `PgSelectBuilder is not assignable to array` (or similar)

**Cause**: A variable was typed as the return of `db.select()` which returns a query builder, not an array.  
**Fix**: Await the query first, then infer the type, or explicitly type as `typeof table.$inferSelect[]`.

---

### "Classes or other objects with methods are not supported"

**Cause**: See [Functions cannot be passed directly to Client Components](#functions-cannot-be-passed-directly-to-client-components) above.

---

## Docker

### Hot reload not working on Linux

**Cause**: The Linux kernel inotify doesn't trigger through Docker bind mounts on some setups.  
**Fix**: `WATCHPACK_POLLING=true` is already set in `docker-compose.yml`. If it's missing, add it:
```yaml
environment:
  WATCHPACK_POLLING: "true"
```

---

### `npm install` inside container doesn't persist

**Cause**: `node_modules` is a named Docker volume mounted over the host folder. Changes from inside the container persist in the volume.  
**Note**: If you install packages from **outside** the container (on your host machine), the volume won't update. Always install packages from inside:
```bash
docker compose exec app npm install <package>
```

---

### Port 5432 already in use

**Cause**: You have a local PostgreSQL instance on your machine.  
**Fix**: The `docker-compose.yml` already maps to port **5433** on the host to avoid this conflict. Use `localhost:5433` when connecting from outside Docker (e.g. in a DB GUI like TablePlus).
