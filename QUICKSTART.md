# AnimaClaw — Quick Start Guide

Get AnimaClaw running in 5 minutes.

---

## Prerequisites

- **Node.js 22+** (LTS recommended)
- **pnpm** (`corepack enable` to auto-install)
- **Git**

---

## Option 1: Vercel Deploy (Recommended for Beginners)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/riyad7creator/AnimaClaw&root=dashboard)

1. Click the button above
2. Vercel will clone and build automatically
3. Add environment variables (see [docs/DEPLOY.md](docs/DEPLOY.md))
4. Visit `https://your-app.vercel.app/setup` to create your admin account

---

## Option 2: Local Development

```bash
# 1. Clone
git clone https://github.com/riyad7creator/AnimaClaw.git
cd AnimaClaw/dashboard

# 2. Install
pnpm install

# 3. Configure
cp .env.example .env
# Edit .env with your credentials

# 4. Run
pnpm dev

# 5. Open http://localhost:3000/setup
# Create your admin account
```

---

## Option 3: VPS Production Deploy

```bash
# 1. Clone on your VPS
git clone https://github.com/riyad7creator/AnimaClaw.git
cd AnimaClaw/dashboard

# 2. One-command install + build
bash install-anima-v1.7.sh

# 3. Start with PM2
pm2 start ecosystem.config.js

# 4. Visit http://your-server:3000/setup
```

---

## First Steps After Login

1. **Create a workspace** — Go to ANIMACLAW > Workspaces > + New Workspace
2. **View agents** — Go to ANIMACLAW > Anima Agents to see your 4 pre-built agents
3. **Check usage** — Go to ANIMACLAW > Usage & Tiers to see your plan
4. **Connect providers** — Add your API keys in Settings for Claude, Kimi, DeepSeek, or Gemini

---

## Pricing Tiers

| Tier | Credits/mo | Agents | Providers | Price |
|------|-----------|--------|-----------|-------|
| Free | 100 | 1 | DeepSeek | $0/mo |
| Pro | 5,000 | Unlimited | All 4 | $49/mo |
| Enterprise | Unlimited | Unlimited | All + Custom | Custom |

---

## Need Help?

- Full deployment guide: [docs/DEPLOY.md](docs/DEPLOY.md)
- Agent documentation: [docs/AGENTS.md](docs/AGENTS.md)
- Technical docs: [DOCUMENTATION.md](DOCUMENTATION.md)
- Contact: riyad@ketami.net

---

*AnimaClaw v1.7 — AI Agents That Actually Work*
