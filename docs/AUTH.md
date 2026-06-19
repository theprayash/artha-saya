# Authentication

NepseWrite uses **Auth.js v5** (next-auth@5 beta) with a custom Credentials provider implementing two-factor login.

---

## Login Flow

```
User visits /login
       │
       ▼
Step 1 — Password check
  Browser → POST /api/auth/send-otp
            body: { email, password }
            │
            ├─ Find admin_users row by email
            ├─ bcrypt.compare(password, user.passwordHash)
            ├─ On fail → return 401 { error: 'Invalid credentials' }
            │
            ├─ Generate random 6-digit OTP
            ├─ bcrypt.hash(otp, 10) → store in otp_tokens table
            │   (expiresAt = now + 10 minutes, used = false)
            │
            ├─ If RESEND_API_KEY set → send email via Resend
            └─ If dev + no API key → log OTP to console + return devOtp in JSON

       │
       ▼
Step 2 — OTP verification
  User enters 6-digit code
  Browser → signIn('credentials', { email, otp })
             → Auth.js Credentials.authorize()
             │
             ├─ Find admin_users row by email
             ├─ Find otp_tokens where:
             │   adminUserId = user.id
             │   AND used = false
             │   AND expiresAt > now()
             │   ORDER BY createdAt DESC (use latest)
             ├─ bcrypt.compare(otp, token.tokenHash)
             ├─ On fail → return null (Auth.js shows error)
             │
             ├─ Mark token as used (UPDATE otp_tokens SET used = true)
             └─ Return { id, email, name } → Auth.js creates JWT session

       │
       ▼
Redirect to /admin
```

---

## Session Management

Auth.js uses **JWT strategy** (no database sessions table). The session is stored as a signed HTTP-only cookie.

- **Cookie name**: `next-auth.session-token` (development) / `__Secure-next-auth.session-token` (HTTPS/production)
- **Expiry**: 24 hours (configurable in `src/lib/auth/config.ts`)
- **Secret**: `NEXTAUTH_SECRET` environment variable — must be 32+ random bytes

Rotate `NEXTAUTH_SECRET` to instantly invalidate all active sessions.

---

## Route Protection

`src/middleware.ts` runs on every request (Edge runtime). It imports only the Edge-safe `config.ts`:

```typescript
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth/config'

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdminRoute = req.nextUrl.pathname.startsWith('/admin')

  if (isAdminRoute && !isLoggedIn) {
    return Response.redirect(new URL('/login', req.url))
  }
})
```

Protected paths: `/admin/**`  
Public paths: everything else (including `/login`, `/setup`, all public pages)

---

## Edge Split Pattern

Auth.js v5 requires two config files because middleware runs on **Edge runtime** (V8 sandbox — no Node.js built-ins), while the Credentials provider needs `bcryptjs` and `pg`:

| File | Runtime | Imports | Purpose |
|---|---|---|---|
| `src/lib/auth/config.ts` | Edge | none (no pg/bcrypt) | JWT callbacks, session shape |
| `src/lib/auth/auth.ts` | Node.js | bcryptjs, drizzle, pg | Credentials provider, OTP verify |

**Never import `auth.ts` from middleware.** It will crash with a module resolution error on Edge.

---

## 2FA Email (Resend)

The OTP email is sent from `src/lib/email/index.ts`.

**Important**: The `Resend` client is instantiated **inside the function**, not at module top level. This prevents the app from crashing on startup when `RESEND_API_KEY` is not set.

```typescript
// Correct — lazy initialization
export async function sendOtpEmail(to: string, otp: string) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('RESEND_API_KEY is not set.')
  const resend = new Resend(apiKey)   // ← inside function
  ...
}

// WRONG — crashes at module load when key is missing
const resend = new Resend(process.env.RESEND_API_KEY)  // ← do not do this
```

---

## Development Mode (No Email)

When `RESEND_API_KEY` is absent and `NODE_ENV=development`:

1. OTP is printed to Docker container logs:
   ```
   [DEV] OTP for admin@example.com: 847291
   ```
2. The `/api/auth/send-otp` response includes `devOtp: "847291"`
3. The login page shows an amber banner: **"Dev mode — OTP: 847291"**

This behaviour is **disabled in production** — if `RESEND_API_KEY` is missing in production, `/send-otp` returns HTTP 503.

---

## First Admin Account Setup

`/setup` creates the first admin account. The route checks whether any row exists in `admin_users`:
- Zero rows → show setup form
- One or more rows → return 404 (prevents creating extra accounts)

To reset the admin password (emergency access):

```bash
# Open Drizzle Studio
docker compose exec app npm run db:studio
# Navigate to admin_users table → edit passwordHash
# Generate a hash: node -e "const b=require('bcryptjs'); b.hash('newpassword',12).then(console.log)"
```

---

## Changing the Admin Email

Admin email is used for OTP delivery. To change it:

1. Open Drizzle Studio or psql
2. `UPDATE admin_users SET email = 'new@email.com' WHERE id = '...'`
3. Ensure the new email is verified in your Resend account

---

## Security Notes

- Passwords are hashed with bcrypt (cost factor 12)
- OTPs are hashed with bcrypt (cost factor 10) — even if the DB is leaked, OTPs cannot be reversed
- OTPs expire in 10 minutes
- Each OTP can only be used once (`used` flag)
- The JWT secret must be kept secret — anyone with it can forge sessions
- HTTPS is required in production to protect the session cookie
