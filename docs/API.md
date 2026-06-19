# API Routes

NepseWrite has two custom API route handlers. Auth.js also mounts its own handler at `/api/auth/[...nextauth]` — that is framework-managed and not documented here.

---

## GET `/api/nepse`

**File**: `src/app/api/nepse/route.ts`  
**Auth**: None (public)  
**Purpose**: Proxies live NEPSE stock data from merolagani.com to avoid CORS issues in the browser.

### Why a proxy?

merolagani.com does not set `Access-Control-Allow-Origin` headers, so browser `fetch()` calls to it are blocked. The Next.js route handler fetches server-side (no CORS restriction) and returns the data as JSON.

### Caching

Results are cached in-memory for **5 minutes**. All concurrent browser requests during those 5 minutes receive the same cached response — only one upstream request is made per cache window.

### Response

```json
{
  "stocks": [
    {
      "symbol": "NABIL",
      "label": "Nabil Bank Ltd.",
      "price": "NPR 1,240.00",
      "change": "+2.31%",
      "up": true
    }
  ],
  "fetchedAt": "2025-01-15T08:30:00.000Z"
}
```

Returns the **top 12 stocks** by turnover value from `market_summary.turnover.detail`.

### Fields

| Field | Type | Description |
|---|---|---|
| symbol | string | NEPSE ticker symbol (e.g. `NABIL`) |
| label | string | Full company name |
| price | string | Formatted last price (e.g. `NPR 1,240.00`) |
| change | string | Formatted percent change (e.g. `+2.31%` or `-1.05%`) |
| up | boolean | `true` if price rose, `false` if fell |

### Error responses

| Status | Meaning |
|---|---|
| 200 | Success |
| 500 | merolagani.com unreachable or returned unexpected data |

On error, `NepseTickerStrip` shows a "Live data unavailable" fallback message.

### Upstream source

`https://merolagani.com/api/market_summary` (approximate — check the route file for the current URL if this ever breaks).

---

## POST `/api/auth/send-otp`

**File**: `src/app/api/auth/send-otp/route.ts`  
**Auth**: None (public — this is step 1 of login)  
**Purpose**: Validates the admin password and sends a 2FA OTP to the admin email.

### Request body

```json
{
  "email": "admin@example.com",
  "password": "the-admin-password"
}
```

### What it does

1. Looks up the admin user by email
2. Verifies `password` against `admin_users.passwordHash` (bcrypt)
3. Generates a cryptographically random 6-digit OTP
4. Stores `bcrypt.hash(otp, 10)` in `otp_tokens` (expires in 10 minutes)
5. Sends OTP email via Resend (or dev bypass — see below)
6. Returns success response

### Response (success)

```json
{
  "ok": true,
  "maskedEmail": "a***@example.com"
}
```

In development without `RESEND_API_KEY`, also includes:
```json
{
  "ok": true,
  "maskedEmail": "a***@example.com",
  "devOtp": "847291"
}
```

### Error responses

| Status | Body | Meaning |
|---|---|---|
| 400 | `{ "error": "Email and password are required." }` | Missing fields |
| 401 | `{ "error": "Invalid credentials." }` | Wrong email or password |
| 503 | `{ "error": "Email service not configured." }` | No RESEND_API_KEY in production |
| 500 | `{ "error": "Internal server error." }` | Unexpected failure |

### Security notes

- The error message for wrong email vs. wrong password is the same ("Invalid credentials") to prevent user enumeration
- OTPs are hashed before storage — the plaintext is never written to disk
- Each OTP expires in 10 minutes and can only be used once

---

## Auth.js routes (`/api/auth/[...nextauth]`)

These are managed by Auth.js internally:

| Route | Purpose |
|---|---|
| `POST /api/auth/callback/credentials` | Called by `signIn('credentials', ...)` on the login page (step 2 — OTP verification) |
| `GET /api/auth/session` | Returns the current session |
| `POST /api/auth/signout` | Signs out and clears the cookie |

Do not call these directly. Use the Auth.js client helpers (`signIn`, `signOut`, `useSession`) from `next-auth/react`.
