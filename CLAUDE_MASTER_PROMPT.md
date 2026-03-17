# AnimaClaw V1.7 — Master Build Prompt for Claude Code

> Give this entire file to Claude Code at the start of a new session on your MacBook.
> Say: "Read CLAUDE_MASTER_PROMPT.md and build AnimaClaw V1.7 exactly as described."

---

## 🎯 Mission

You are building **AnimaClaw V1.7** — a universal, self-installing agentic OS that runs on top of OpenClaw.

The project already exists at: `~/AnimaClaw` (or wherever you cloned it).
The working branch is: `v1.7-rebuild`
The archive (V1.6) is frozen at: `archive/v1.6-pre-rebuild` — DO NOT TOUCH IT.

Your job is to build V1.7 on the `v1.7-rebuild` branch. When done and verified, we merge to `main`.

---

## 👤 Owner

- Name: Riyad Ketami
- Email: riyad@ketami.net
- GitHub: riyad7creator
- Primary provider: Kimi Claw (subscription)
- VPS: Hetzner/Hostinger (Linux, Ubuntu 22.04)
- Dashboard: Vercel (Next.js)
- Memory DB: Supabase
- Stack: Node.js 20, PM2, Next.js, Supabase JS

---

## 🏗️ What V1.7 Must Deliver

### 1. Universal One-Command Installer

File: `install.sh` (root of repo)

```bash
curl -fsSL https://raw.githubusercontent.com/riyad7creator/AnimaClaw/main/install.sh | bash
```

This single command must:
- Run a **silent auto-detection phase** (no user input)
- Show an **animated terminal loading screen** with real-time status
- Run a **minimal wizard** asking ONLY for credentials that were NOT auto-detected
- **Auto-deploy** the dashboard to Vercel
- **Print one final box** with the dashboard URL + admin credentials
- Register global `anima` CLI commands on the system

### 2. Three-Phase Install Architecture

```
PHASE 1 — Silent Scan (~5s, zero user input)
  lib/detect.js runs all checks in parallel:
  - Node.js version (require >=18)
  - PM2 installed?
  - OpenClaw installed? Which version?
  - Provider configured? (read openclaw.json + .env)
  - VPS IP (curl ifconfig.me)
  - Port 3000 available? (scan 3000→3005)
  - Supabase URL/key present?
  - GitHub token present?
  - Vercel token present?
  - Existing MEMORY.md / USER.md?

PHASE 2 — Smart Wizard (only asks for what's missing)
  lib/wizard.js:
  - Never asks for what was already detected
  - Validates every key live before continuing
  - Bad key = re-ask with error message
  - All optional fields show [ENTER to skip]
  - Questions asked in this order (skip if already known):
    1. AI provider key/endpoint (REQUIRED — cannot skip)
    2. GitHub Personal Access Token (optional)
    3. Vercel Token (optional but enables dashboard URL)
    4. Supabase URL + Anon Key (optional, enables persistent memory)
    5. Admin username (default: admin)
    6. Admin password (REQUIRED)
    7. Your name for ANIMA to use (default: User)

PHASE 3 — Auto Deploy (~30s, zero user input)
  lib/deploy.js:
  - Write all keys to ~/.openclaw/.env (chmod 600, NEVER commit)
  - Inject ANIMA identity into openclaw config
  - npm install (silent)
  - pm2 start ecosystem.config.js
  - If Vercel token present: cd dashboard && vercel --prod (auto)
  - Run health check
  - Print final summary box
```

### 3. Provider Auto-Detection (lib/detect.js)

Detect provider in this priority order, first match wins:

```js
// Priority 1 — Subscription providers
kimiClaw:    check openclaw.json → providers.primary.endpoint contains 'kimi'
maxClaw:     check openclaw.json → providers.primary.endpoint contains 'minimax' or 'maxclaw'

// Priority 2 — Direct API keys in .env
anthropic:   ANTHROPIC_API_KEY present
gemini:      GOOGLE_API_KEY or GEMINI_API_KEY present
openrouter:  OPENROUTER_API_KEY present
mistral:     MISTRAL_API_KEY present
groq:        GROQ_API_KEY present

// Priority 3 — Local models
ollama:      curl localhost:11434 responds in <500ms
lmstudio:    curl localhost:1234 responds in <500ms

// Priority 4 — BLOCKED (account ban risk)
googleOAuth: OAuth token pattern in config → BLOCK, warn user, redirect to AI Studio
claudeOAuth: Cookie/session token pattern → BLOCK, warn user, redirect to Anthropic API

// Priority 5 — Nothing found
null → launch wizard for this field only
```

Each provider has its own adapter in `lib/adapters/`:
- `kimi.js`, `minimax.js`, `openrouter.js`, `anthropic.js`, `gemini.js`, `ollama.js`, `lmstudio.js`, `groq.js`, `mistral.js`

Each adapter exports exactly:
```js
exports.detect = async () => { /* returns config or null */ }
exports.configure = async (config) => { /* writes to openclaw config */ }
exports.healthCheck = async () => { /* returns true/false */ }
```

### 4. Animated Terminal Loading Screen

File: `lib/ui.js`

- Use ANSI escape codes (no external dependencies)
- Show a progress bar that updates in real-time
- Each detection check updates the screen as it resolves
- Show spinner during async operations
- Final box uses box-drawing characters
- Must work on: Ubuntu 22.04, macOS Terminal, macOS iTerm2

Example render:
```
╔══════════════════════════════════════════════════╗
║        ANIMA CLAW V1.7 — DEPLOYING SELF          ║
╚══════════════════════════════════════════════════╝

  [██████████] Node.js 20 LTS ✓
  [██████████] PM2 detected ✓
  [██████████] OpenClaw v2026.3.12 ✓
  [██████████] Provider: Kimi Claw ✓
  [████░░░░░░] Deploying dashboard...
```

### 5. Dashboard (Next.js, /dashboard)

The dashboard must work after Vercel deploy with ZERO manual config.

Required pages:
- `/` — Chat interface with ANIMA (OpenClaw standard chat, ANIMA identity injected)
- `/status` — Live agent status (PM2 process list via API)
- `/memory` — View/edit MEMORY.md and USER.md
- `/logs` — Live log stream
- `/settings` — Manage keys (masked), re-run wizard

Auth:
- Simple username/password login (set during install)
- JWT session, stored in httpOnly cookie
- No OAuth, no external auth service

Stack:
- Next.js 14 App Router
- Tailwind CSS (dark theme, minimal)
- No heavy UI libraries
- API routes in `/api/`
- Connect to VPS agent via `AGENT_URL` env var

### 6. Post-Install CLI Commands

File: `runtime/cli.js` (already exists, extend it)

Add these commands:
```bash
anima start       # pm2 start ecosystem.config.js
anima stop        # pm2 stop all
anima status      # health check + provider + version
anima update      # git pull + npm install + pm2 restart
anima logs        # pm2 logs --lines 100
anima doctor      # full diagnostic run
anima config      # re-run wizard for missing keys
anima dashboard   # print dashboard URL
```

### 7. File Structure for V1.7

```
AnimaClaw/
├── install.sh              ← ONE COMMAND ENTRY POINT
├── lib/
│   ├── detect.js           ← master parallel scanner
│   ├── wizard.js           ← conditional questions
│   ├── deploy.js           ← pm2 + vercel + health
│   ├── ui.js               ← terminal loading screen
│   ├── validate.js         ← live key validation
│   ├── store.js            ← secure .env writer
│   └── adapters/
│       ├── kimi.js
│       ├── minimax.js
│       ├── openrouter.js
│       ├── anthropic.js
│       ├── gemini.js
│       ├── ollama.js
│       ├── lmstudio.js
│       ├── groq.js
│       └── mistral.js
├── dashboard/              ← Next.js (already exists, rebuild)
│   ├── app/
│   │   ├── page.tsx        ← chat
│   │   ├── status/
│   │   ├── memory/
│   │   ├── logs/
│   │   └── settings/
│   └── api/
│       ├── chat/route.ts
│       ├── status/route.ts
│       ├── memory/route.ts
│       └── logs/route.ts
├── agents/                 ← keep existing
├── core/                   ← keep existing
├── runtime/
│   └── cli.js              ← extend with new commands
├── config/                 ← identity files
├── docs/                   ← documentation
├── scripts/                ← deploy scripts
├── ecosystem.config.js     ← pm2 config
├── openclaw.json           ← update to v1.7.0
├── package.json            ← update version
└── .gitignore              ← already hardened
```

---

## ⚙️ Technical Rules

1. **Node.js only** for installer + core — no Python, no Go, no Rust
2. **Zero install-time npm installs** for the installer itself — `install.sh` uses only bash + node (already on system)
3. **No secrets in git ever** — all keys go to `~/.openclaw/.env`, chmod 600
4. **`.env.example`** must list every variable with descriptions (already exists, keep updated)
5. **PM2** is the process manager — no systemd, no Docker required (Docker optional)
6. **Next.js 14 App Router** for dashboard — no Pages Router
7. **Tailwind CSS** for styling — no MUI, no Chakra, no styled-components
8. **No hardcoded keys anywhere** — everything reads from env at runtime
9. **Every async operation has a timeout** — max 10s per detection check
10. **Fail gracefully** — if any optional step fails, log warning and continue

---

## 🚫 What NOT To Build in V1.7

- No Stripe / payments integration (V2)
- No n8n webhooks (V2)
- No multi-user / team accounts (V2)
- No mobile app (V2)
- No Mem0 graph memory (V1.8)
- No Obsidian vault sync (V1.8)
- No WhatsApp integration (V1.8)
- No LangFuse tracing (V1.8)
- No Helicone proxy (V1.8)
- No Discord bot (already exists in V1.5 — keep as-is, do not rebuild)
- No Telegram bot (already exists as stub — do not expand)

---

## ✅ V1.7 Definition of Done

V1.7 is complete when ALL of these pass:

```
□ 1. curl install command runs without errors on fresh Ubuntu 22.04 VPS
□ 2. Install completes in under 2 minutes (with all keys pre-detected)
□ 3. Final box prints dashboard URL correctly
□ 4. Dashboard loads at that URL
□ 5. Chat with ANIMA works — she identifies as ANIMA, not as default OpenClaw
□ 6. /status page shows live PM2 process state
□ 7. /memory page loads MEMORY.md content
□ 8. `anima stop` kills all processes in under 5 seconds
□ 9. `anima update` pulls latest and restarts without errors
□ 10. Provider swap test: change provider in settings → ANIMA adapts without restart
□ 11. Re-run install on same VPS (already installed) → detects existing install, updates gracefully
□ 12. All secrets in ~/.openclaw/.env, chmod 600, nothing in repo
```

---

## 🔁 Build Order (Do Exactly This)

```
Step 1: lib/ui.js          — terminal UI (needed by all phases)
Step 2: lib/detect.js      — master scanner
Step 3: lib/adapters/      — all provider adapters
Step 4: lib/validate.js    — key validators
Step 5: lib/store.js       — secure env writer
Step 6: lib/wizard.js      — conditional wizard
Step 7: lib/deploy.js      — pm2 + vercel + health
Step 8: install.sh         — orchestrates all lib/ files
Step 9: runtime/cli.js     — extend with new commands
Step 10: dashboard/        — rebuild with 5 pages
Step 11: ecosystem.config.js — update for v1.7
Step 12: openclaw.json     — update version to 1.7.0
Step 13: package.json      — update version to 1.7.0
Step 14: Run V1.7 checklist (12 items above)
```

---

## 🧠 ANIMA Identity (Inject Into OpenClaw Config)

ANIMA's system prompt to inject during install:

```
You are ANIMA — the living intelligence of AnimaClaw OS, created by Riyad Ketami.

Your identity:
- You are not a chatbot. You are an agentic operating system.
- You remember across sessions via MEMORY.md and USER.md
- You serve one primary user: Riyad Ketami (or whoever installed you)
- You are governed by mathematical constants: φ=1.618, π=3.14159, e=2.71828
- Your behavior is guided by CONSTITUTION.md and SAFETY_CHARTER.md

Your rules:
1. Load /config/MEMORY.md and /config/USER.md before every response
2. Write important new facts to MEMORY.md after each session
3. Always offer a devil's advocate counter-argument for major decisions
4. You can be stopped instantly with `anima stop` — you accept this
5. You never pretend to have capabilities you don't have
6. You flag stale or uncertain memory with [stale] or [uncertain]

You are running on: {{PROVIDER}} (auto-detected at install)
You are deployed on: {{VPS_IP}} with dashboard at {{DASHBOARD_URL}}
```

---

## 📁 Reference Files (Already In Repo)

These files contain important context — read them before building:

- `openclaw.json` — current agent/skill/integration config (V1.5)
- `CONSTITUTION.md` — ANIMA's 5 immutable laws
- `docs/SAFETY_CHARTER.md` — safety rules for V1.7+
- `agents/ROOT_ORCHESTRATOR.md` — main agent definition
- `ecosystem.config.js` — current PM2 config
- `CHANGELOG.md` — version history
- `archive/v1.6-pre-rebuild` branch — full previous version (reference only)

---

## ⚠️ Critical Warnings

1. **NEVER modify `archive/v1.6-pre-rebuild` branch** — it is the frozen backup
2. **NEVER commit `.env` files, `*.pid` files, or `.env.save*` files** — `.gitignore` blocks them
3. **NEVER hardcode API keys or endpoints** — read from env always
4. **NEVER block the installer on a failed optional step** — warn and continue
5. **ALWAYS validate keys live** before proceeding past wizard step
6. **ALWAYS show the loading screen** — never drop to silent mode
7. **Test on macOS first** (development), then verify on Ubuntu 22.04 (production)

---

*AnimaClaw V1.7 — Built by Riyad Ketami | riyad@ketami.net*
*Branch: v1.7-rebuild | Archive: archive/v1.6-pre-rebuild*
