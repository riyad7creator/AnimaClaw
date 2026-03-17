# AnimaClaw — The Living Agentic Operating System

![Version](https://img.shields.io/badge/version-1.7.0-6366f1)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D22-brightgreen)
![Next.js](https://img.shields.io/badge/Next.js-16-black)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/riyad7creator/AnimaClaw&root=dashboard)

**A self-deploying, self-evolving agentic operating system with multi-provider AI routing, multi-tenant workspaces, and structured agent memory.**

**Author:** Riyad Ketami — riyad@ketami.net | Algeria Business Bay
**Repository:** [github.com/riyad7creator/AnimaClaw](https://github.com/riyad7creator/AnimaClaw)

---

## What Makes AnimaClaw Different

- **4 Production-Ready Agents** — Content, Research, Customer Service, and Workflow agents ship ready to deploy with system prompts, tools, and memory scopes
- **Multi-Provider Routing** — Claude, Kimi, DeepSeek, and Gemini with automatic failover. No vendor lock-in
- **Multi-Tenant Workspaces** — Client isolation with Supabase RLS, independent credit pools, and role-based access
- **Structured Memory** — Per-agent/user/task memory (not raw chat history) with search, edit, and context window optimization
- **SaaS-Ready Tiers** — Free, Pro, and Enterprise plans with usage tracking and billing integration

---

## Architecture

```
User Browser
    |
    v
AnimaClaw Mission Control (dashboard/)
    |   Next.js 16 + React 19 + Zustand + SQLite
    |
    +---> OpenClaw Gateway Adapter
    |         |
    |         v
    |     Provider Router
    |     [ Claude | Kimi | DeepSeek | Gemini ]
    |
    +---> Structured Memory (Supabase)
    |
    +---> SOLARIS Engine (core/)
          phi-routing, quantum decisions, evolution
```

---

## Quick Start

```bash
# Clone
git clone https://github.com/riyad7creator/AnimaClaw.git
cd AnimaClaw/dashboard

# Install + build
pnpm install && pnpm build

# Start
pnpm start
# Visit http://localhost:3000/setup
```

Or deploy to Vercel in one click: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/riyad7creator/AnimaClaw&root=dashboard)

See [QUICKSTART.md](QUICKSTART.md) for the full 5-minute guide.

---

## Dashboard — Mission Control v1.7

Built on [Mission Control](https://github.com/builderz-labs/mission-control) (MIT), customized with AnimaClaw integrations:

| Panel | Description |
|-------|-------------|
| Anima Agents | 4 pre-built agents with system prompts, tools, tier limits |
| Client Workspaces | Multi-tenant isolation with Supabase RLS and credit tracking |
| Usage & Tiers | Free/Pro/Enterprise with provider breakdown |
| Memory Graph | Structured memory viewer with search, edit, and workflow state |

Plus the full Mission Control suite: Agent management, Tasks, Chat, Activity feeds, Cost tracking, Cron, Webhooks, Security audit, and 80+ API endpoints.

---

## Agents

| Agent | Domain | Languages | Tier |
|-------|--------|-----------|------|
| Content Agent | TikTok/Reels/SEO content generation | EN, FR, AR | Free |
| Research Agent | Deep research with source verification | EN, FR | Pro |
| Customer Service | Multi-language CRM support | EN, FR, AR | Pro |
| Workflow Agent | Multi-step orchestration pipelines | EN | Enterprise |

Full documentation: [docs/AGENTS.md](docs/AGENTS.md)

---

## Deploy

| Method | Command | Guide |
|--------|---------|-------|
| **Vercel** | One-click button above | [docs/DEPLOY.md](docs/DEPLOY.md) |
| **VPS + PM2** | `bash install-anima-v1.7.sh && pm2 start ecosystem.config.js` | [docs/DEPLOY.md](docs/DEPLOY.md) |
| **Docker** | `docker compose up -d` | [docs/DEPLOY.md](docs/DEPLOY.md) |
| **Dev** | `pnpm dev` | [QUICKSTART.md](QUICKSTART.md) |

---

## Project Structure

```
AnimaClaw/
+-- dashboard/          # Mission Control v1.7 (Next.js 16)
|   +-- src/components/anima/  # 4 AnimaClaw panels
|   +-- src/lib/gateways/     # Multi-provider gateway adapter
|   +-- src/theme/             # AnimaClaw branding
|   +-- ecosystem.config.js    # PM2 production config
|   +-- vercel.json            # Vercel deploy config
+-- core/               # SOLARIS engine + config
+-- agents/             # Agent definitions
+-- runtime/            # Node.js execution engine
+-- skills/             # OpenClaw skill modules
+-- integrations/       # External service connectors
+-- setup/              # Installer + schema + verification
+-- docs/               # Deployment + agent documentation
+-- SOLARIS.md          # Drop into OpenClaw to boot
+-- ANIMA_FLASH.sh      # Flash installer
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [QUICKSTART.md](QUICKSTART.md) | 5-minute getting started guide |
| [docs/AGENTS.md](docs/AGENTS.md) | Full agent documentation (prompts, tools, use cases) |
| [docs/DEPLOY.md](docs/DEPLOY.md) | Complete deployment guide (Vercel, VPS, Docker) |
| [DOCUMENTATION.md](DOCUMENTATION.md) | Full technical documentation |
| [WHITEPAPER.md](WHITEPAPER.md) | Architecture and mathematical foundation |
| [CHANGELOG.md](CHANGELOG.md) | Version history |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contributor guidelines |
| [SECURITY.md](SECURITY.md) | Security policy |

---

## Version History

| Version | Date | Highlights |
|---------|------|------------|
| **v1.7** | 2026-03-17 | Mission Control dashboard, multi-provider routing, multi-tenant workspaces, Vercel deploy |
| v1.5 | 2026-03 | Integration layer: n8n, Helicone, Langfuse, Ollama, Lark |
| v1.4 | 2026-03 | Three-mode onboarding: SPARK, ORACLE, WILD |
| v1.3 | 2026-03 | Living Update Converter: 4-transformation auto-sync |
| v1.2 | 2026-03 | Quantum Intelligence Layer: Laws 6-12 |
| v1.1 | 2026-03 | Immune System: IMMUNE_AGENT + morphallaxis |
| v1.0 | 2026-02 | Genesis: fractal agents, phi-routing, Supabase schema |

---

## License

MIT License — see [LICENSE](LICENSE)

Copyright 2026 Riyad Ketami

---

## Contact

**Created by:** Riyad Ketami
**Email:** riyad@ketami.net
**Location:** Algeria Business Bay
**Repository:** [github.com/riyad7creator/AnimaClaw](https://github.com/riyad7creator/AnimaClaw)

---

*AnimaClaw v1.7 — AI Agents That Actually Work.*
