# AnimaClaw — Deployment Guide

Complete guide for deploying AnimaClaw Mission Control v1.7.

---

## Option 1: Vercel (Recommended)

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/riyad7creator/AnimaClaw&root=dashboard)

### Manual Vercel Deploy

```bash
cd dashboard
npx vercel --prod
```

Set **Root Directory** to `dashboard` in Vercel project settings.

### Vercel Environment Variables

#### Required

| Variable | Value |
|----------|-------|
| `MC_ALLOW_ANY_HOST` | `true` |
| `MC_COOKIE_SAMESITE` | `strict` |
| `MC_DEFAULT_GATEWAY_NAME` | `primary` |
| `MC_COORDINATOR_AGENT` | `coordinator` |
| `NEXT_PUBLIC_COORDINATOR_AGENT` | `coordinator` |
| `NEXT_PUBLIC_GATEWAY_CLIENT_ID` | `openclaw-control-ui` |
| `NEXT_PUBLIC_GATEWAY_PORT` | `18789` |
| `NEXT_PUBLIC_GATEWAY_OPTIONAL` | `true` |
| `ANIMA_CLAW_MODE` | `true` |
| `ANIMA_PROVIDERS` | `claude,kimi,deepseek,gemini` |
| `AGENT_MEMORY_MODE` | `structured` |
| `CLIENT_WORKSPACES_ENABLED` | `true` |
| `TIERED_USAGE_ENABLED` | `true` |

#### Secrets (do not commit)

| Variable | Description |
|----------|-------------|
| `AUTH_USER` | Admin username |
| `AUTH_PASS` | Admin password |
| `AUTH_SECRET` | Session signing key (auto-generated if blank) |
| `API_KEY` | API access key (auto-generated if blank) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway auth token |
| `OPENROUTER_API_KEY` | OpenRouter key (optional) |
| `KIMI_API_KEY` | Kimi key (optional) |
| `DEEPSEEK_API_KEY` | DeepSeek key (optional) |

---

## Option 2: VPS with PM2

### Prerequisites

- Ubuntu 22.04+ / Debian 12+
- Node.js 22+ (`nvm install 22`)
- pnpm (`corepack enable`)
- PM2 (`npm install -g pm2`)

### Deploy

```bash
# Clone
git clone https://github.com/riyad7creator/AnimaClaw.git
cd AnimaClaw/dashboard

# One-command install
bash install-anima-v1.7.sh

# Start with PM2 (cluster mode)
pm2 start ecosystem.config.js

# Save and enable startup
pm2 save
pm2 startup
```

### PM2 Commands

```bash
pm2 list                              # List processes
pm2 logs anima-mission-control-v1.7   # View logs
pm2 restart anima-mission-control-v1.7 # Restart
pm2 monit                              # Interactive monitor
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Add SSL with: `sudo certbot --nginx -d your-domain.com`

---

## Option 3: Docker

```bash
cd dashboard
docker compose up -d
```

For production hardening:
```bash
docker compose -f docker-compose.yml -f docker-compose.hardened.yml up -d
```

---

## Post-Deploy Checklist

1. Visit `/setup` to create admin account
2. Set environment variables for your providers
3. Test: Navigate to ANIMACLAW > Anima Agents
4. Create a workspace: ANIMACLAW > Workspaces
5. Configure providers: Settings > Integrations

---

## Troubleshooting

### Build fails with "250 MB serverless function size"
The `.vercelignore` and `outputFileTracingExcludes` in `next.config.js` should prevent this. If it recurs, check that `.pnpm-store` is not being uploaded.

### "better-sqlite3" build error
Native addon needs rebuild: `pnpm rebuild better-sqlite3`

### Dashboard shows blank page
Check browser console for CSP errors. Ensure `MC_ALLOW_ANY_HOST=true` is set on Vercel.

### Gateway features not working
Set `NEXT_PUBLIC_GATEWAY_OPTIONAL=true` for standalone deployments. Gateway WebSocket features require a separate VPS running OpenClaw gateway.

### Login page loops
Verify `AUTH_USER` and `AUTH_PASS` are set, or visit `/setup` to create an account.

### PM2 processes disappear after reboot
Run `pm2 startup` and `pm2 save` to persist process list.

---

## Environment Variables — Complete Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | `3000` | Server port |
| `AUTH_USER` | No | — | Seed admin username |
| `AUTH_PASS` | No | — | Seed admin password |
| `AUTH_SECRET` | No | auto | Session signing key |
| `API_KEY` | No | auto | API access key |
| `MC_ALLOW_ANY_HOST` | No | — | Allow any hostname |
| `MC_ALLOWED_HOSTS` | No | `localhost,127.0.0.1` | Allowed hostnames |
| `MC_COOKIE_SECURE` | No | `true` (prod) | Secure cookies |
| `MC_COOKIE_SAMESITE` | No | `strict` | Cookie SameSite |
| `MC_DEFAULT_GATEWAY_NAME` | No | `primary` | Gateway name |
| `MC_COORDINATOR_AGENT` | No | `coordinator` | Coordinator ID |
| `OPENCLAW_HOME` | No | — | OpenClaw home dir |
| `OPENCLAW_GATEWAY_HOST` | No | `127.0.0.1` | Gateway host |
| `OPENCLAW_GATEWAY_PORT` | No | `18789` | Gateway port |
| `OPENCLAW_GATEWAY_TOKEN` | No | — | Gateway auth token |
| `NEXT_PUBLIC_GATEWAY_HOST` | No | — | Frontend gateway host |
| `NEXT_PUBLIC_GATEWAY_PORT` | No | `18789` | Frontend gateway port |
| `NEXT_PUBLIC_GATEWAY_OPTIONAL` | No | `false` | Run without gateway |
| `NEXT_PUBLIC_GATEWAY_CLIENT_ID` | No | `openclaw-control-ui` | WS client ID |
| `ANIMA_CLAW_MODE` | No | — | Enable AnimaClaw features |
| `SUPABASE_URL` | No | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | No | — | Supabase anon key |
| `OPENCLAW_GATEWAY_URL` | No | `http://localhost:8000/gateway` | Gateway URL |
| `ANIMA_PROVIDERS` | No | — | Active providers (comma-sep) |
| `AGENT_MEMORY_MODE` | No | `structured` | Memory mode |
| `CLIENT_WORKSPACES_ENABLED` | No | — | Enable workspaces |
| `TIERED_USAGE_ENABLED` | No | — | Enable usage tiers |
| `ANIMA_BRAND_COLOR` | No | `#6366f1` | Brand color |

---

*AnimaClaw v1.7 — Complete Deployment Guide*
