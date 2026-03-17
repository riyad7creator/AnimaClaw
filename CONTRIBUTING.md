# Contributing to AnimaClaw

Thank you for your interest in contributing to AnimaClaw. This guide will help you get started.

---

## Getting Started

1. Fork the repository: https://github.com/riyad7creator/AnimaClaw
2. Clone your fork: `git clone https://github.com/YOUR_USER/AnimaClaw.git`
3. Create a branch: `git checkout -b feat/your-feature`
4. Install dashboard dependencies: `cd dashboard && pnpm install`
5. Run dev server: `pnpm dev`

---

## Code Style

- **Language:** TypeScript (strict mode)
- **Framework:** Next.js 16 (App Router)
- **UI:** React 19 + Tailwind CSS 3
- **State:** Zustand
- **Package manager:** pnpm only (no npm/yarn)
- **Icons:** Raw SVG inline — no icon libraries
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`)

---

## How to Add a New Agent Skill

1. Create a new agent definition in `agents/` with a `.md` file
2. Register the agent in `dashboard/src/components/anima/AnimaAgentList.tsx`:
   ```typescript
   {
     id: 'your-agent',
     name: 'Your Agent',
     type: 'your-type',
     description: 'What it does',
     systemPrompt: 'Full system prompt...',
     tools: ['tool-1', 'tool-2'],
     memoryScope: 'your-scope',
     tier: 'pro',
     status: 'active',
     tasksCompleted: 0,
     languages: ['en'],
   }
   ```
3. Add any required tools to the gateway adapter

---

## How to Add a New Provider

1. Open `dashboard/src/lib/gateways/anima-openclaw.ts`
2. Add the provider to `DEFAULT_PROVIDERS`:
   ```typescript
   { id: 'your-provider', name: 'Provider Name', category: 'speed', status: 'active' }
   ```
3. Add it to the appropriate routing pool (`speed` or `reasoning`)
4. Add the API key env var to `.env.example`
5. Document in `docs/DEPLOY.md`

---

## Pull Request Guidelines

1. **One feature per PR** — keep changes focused
2. **Title format:** `feat: add X` / `fix: resolve Y` / `docs: update Z`
3. **Description:** Include what changed and why
4. **Tests:** Run `pnpm build` to verify compilation
5. **No breaking changes** without discussion in an issue first

---

## Reporting Bugs

Open an issue at https://github.com/riyad7creator/AnimaClaw/issues with:
- Steps to reproduce
- Expected vs actual behavior
- Node.js version and OS
- Relevant logs

---

## Contact

- **Maintainer:** Riyad Ketami — riyad@ketami.net
- **Repository:** https://github.com/riyad7creator/AnimaClaw

---

*Thank you for helping make AnimaClaw better.*
