# AnimaClaw Mission Control v1.7 — Vercel Deployment Guide

## Quick Deploy

1. Push this repo to GitHub
2. Import into Vercel: https://vercel.com/new
3. Set **Root Directory** to `dashboard`
4. Add the environment variables below
5. Deploy

## Environment Variables

Copy these into Vercel → Project Settings → Environment Variables.

### Required

| Variable | Value | Notes |
|----------|-------|-------|
| `MC_ALLOW_ANY_HOST` | `true` | Allow Vercel's generated hostnames |
| `MC_COOKIE_SAMESITE` | `strict` | Session cookie policy |
| `MC_DEFAULT_GATEWAY_NAME` | `primary` | Default gateway name |
| `MC_COORDINATOR_AGENT` | `coordinator` | Coordinator agent identity |
| `NEXT_PUBLIC_COORDINATOR_AGENT` | `coordinator` | Frontend coordinator identity |
| `NEXT_PUBLIC_GATEWAY_CLIENT_ID` | `openclaw-control-ui` | WebSocket client ID |
| `NEXT_PUBLIC_GATEWAY_PORT` | `18789` | Gateway port (frontend) |
| `NEXT_PUBLIC_GATEWAY_OPTIONAL` | `true` | Run without gateway (standalone) |

### AnimaClaw v1.7

| Variable | Value | Notes |
|----------|-------|-------|
| `ANIMA_CLAW_MODE` | `true` | Enable AnimaClaw features |
| `ANIMA_PROVIDERS` | `claude,kimi,deepseek,gemini` | Active AI providers |
| `AGENT_MEMORY_MODE` | `structured` | Memory storage mode |
| `CLIENT_WORKSPACES_ENABLED` | `true` | Multi-tenant workspaces |
| `TIERED_USAGE_ENABLED` | `true` | Usage tier tracking |
| `ANIMA_BRAND_COLOR` | `#6366f1` | Brand accent color |
| `OPENCLAW_GATEWAY_URL` | `http://localhost:8000/gateway` | Gateway URL (update for production) |

### Secrets (add in Vercel, DO NOT commit)

| Variable | Notes |
|----------|-------|
| `AUTH_USER` | Admin username |
| `AUTH_PASS` | Admin password |
| `AUTH_SECRET` | Session signing key (auto-generated if omitted) |
| `API_KEY` | API access key (auto-generated if omitted) |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anonymous key |
| `OPENCLAW_GATEWAY_TOKEN` | Gateway auth token |
| `OPENROUTER_API_KEY` | OpenRouter API key (optional) |
| `KIMI_API_KEY` | Kimi API key (optional) |
| `DEEPSEEK_API_KEY` | DeepSeek API key (optional) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID (optional) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID for frontend (optional) |

## Post-Deploy

1. Visit `https://your-app.vercel.app/setup` to create your admin account
2. Navigate to **ANIMACLAW → Workspaces** to create your first workspace
3. Configure providers in **ANIMACLAW → Usage & Tiers**

## Notes

- `output: 'standalone'` is already set in `next.config.js`
- SQLite (better-sqlite3) works on Vercel but data resets on redeploy — connect Supabase for persistence
- Gateway WebSocket features require a separate VPS running OpenClaw gateway
- Set `NEXT_PUBLIC_GATEWAY_OPTIONAL=true` for Vercel-only deployments without a gateway
