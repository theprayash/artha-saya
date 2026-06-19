# Deployment

This guide covers deploying NepseWrite to a production VPS (Ubuntu/Debian). Adjust commands for other hosts as needed.

---

## Prerequisites

- A VPS with at least 1 GB RAM (2 GB recommended)
- Ubuntu 22.04 or Debian 12
- A domain name pointed at the server's IP
- Docker and Docker Compose installed on the server

---

## Step 1 — Install Docker (if not already)

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
# Log out and back in for group change to take effect
```

---

## Step 2 — Clone the project on the server

```bash
git clone https://github.com/yourusername/blog-site.git
cd blog-site
```

---

## Step 3 — Environment variables

```bash
cp .env.example .env
nano .env
```

Set all required variables:

```env
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=long-random-string-minimum-32-chars

# Your production domain
NEXTAUTH_URL=https://yourdomain.com

# Resend API key (required for 2FA to work in production)
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx

# Your verified sender email in Resend
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Strong DB password for production
POSTGRES_PASSWORD=change-this-to-a-strong-password
```

Also update `docker-compose.yml` for production:
```yaml
db:
  environment:
    POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}

app:
  environment:
    DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/nepsewrite
    NEXTAUTH_URL: ${NEXTAUTH_URL}
```

---

## Step 4 — Build and start for production

Create a `docker-compose.prod.yml` override (or modify the main file):

```yaml
services:
  app:
    build:
      target: production
    command: ["node", "server.js"]
    environment:
      NODE_ENV: production
    restart: unless-stopped

  db:
    restart: unless-stopped
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Then build and start:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

For a simpler setup (single VPS, production build in the same Dockerfile):

```bash
# Edit Dockerfile to run `npm run build && node .next/standalone/server.js` in prod
# Or deploy as-is and accept slightly slower dev-server mode in production
docker compose up -d --build
```

---

## Step 5 — Nginx reverse proxy + HTTPS

Install Nginx and Certbot:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

Create a site config at `/etc/nginx/sites-available/nepsewrite`:

```nginx
server {
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    listen 80;
}
```

Enable and get SSL:

```bash
sudo ln -s /etc/nginx/sites-available/nepsewrite /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Certbot auto-renews. Verify with `sudo certbot renew --dry-run`.

---

## Step 6 — Create first admin account

Visit `https://yourdomain.com/setup` and create the admin account. The page disappears after first use.

---

## Step 7 — Verify 2FA works

1. Log in at `https://yourdomain.com/login`
2. Enter email + password → OTP email should arrive within seconds
3. Enter OTP → you should reach `/admin`

If OTP email does not arrive, check:
- `RESEND_API_KEY` is correct in `.env`
- Sender domain is verified in Resend dashboard
- Docker logs: `docker compose logs app -f`

---

## Environment Variables Reference (Production)

| Variable | Required | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | Yes | JWT signing secret — at least 32 random chars |
| `NEXTAUTH_URL` | Yes | Full production URL, e.g. `https://yourdomain.com` |
| `RESEND_API_KEY` | Yes | Resend API key for OTP emails |
| `RESEND_FROM_EMAIL` | Recommended | Verified sender address in Resend |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `POSTGRES_PASSWORD` | Yes | If overriding the default `postgres` password |

---

## Database Backups

Set up a daily cron backup:

```bash
# Edit crontab
crontab -e

# Add this line (runs daily at 2 AM, keeps 30 days)
0 2 * * * docker compose -f /path/to/blog-site/docker-compose.yml exec -T db pg_dump -U postgres nepsewrite | gzip > /backups/nepsewrite-$(date +\%Y\%m\%d).sql.gz && find /backups -name "nepsewrite-*.sql.gz" -mtime +30 -delete
```

Create the backup directory: `sudo mkdir -p /backups`

---

## Updating the App

```bash
cd blog-site
git pull
docker compose up -d --build
```

The database schema is auto-updated by `drizzle-kit push` on container start.

---

## Security Checklist

- [ ] `NEXTAUTH_SECRET` is unique and at least 32 characters
- [ ] Database is NOT exposed on a public port (remove ports mapping from `docker-compose.yml` in production)
- [ ] HTTPS is enabled via Certbot
- [ ] `RESEND_API_KEY` is set (2FA works)
- [ ] `/setup` returns 404 after first admin is created
- [ ] Server firewall allows only ports 80, 443, and SSH (22)
- [ ] Regular database backups are configured
- [ ] `NODE_ENV=production` is set in the app container
