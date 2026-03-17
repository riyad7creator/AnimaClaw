# ANIMA Safety Charter — V1.7

> Authored from 10-year projection audit. Effective from V1.7.

## Core Principle
ANIMA must remain: **useful, inspectable, and interruptible.**
More capable — never more unquestionable.

---

## Must-Have Safeguards (V1.7+)

- **Kill switch** — `pm2 stop anima-v1.7` kills all processes in <5s
- **Tool approval gates** — write/delete/shell actions require human approval
- **Memory flush** — ANIMA writes to MEMORY.md before context compaction
- **No auto-write to sensitive systems** — filesystem writes need approval

## Should-Have (V1.8+)

- **Memory confidence labels** — `[fact]`, `[interpretation]`, `[guess]`, `[stale]`
- **Monthly memory review** — ANIMA surfaces 10 oldest assumptions
- **Devil's advocate mode** — every major suggestion includes a counter-argument
- **Obsidian vault** — linked memory graph, cross-device sync

## Planned (V2)

- Decision/approval queue with audit trail
- Model routing visibility + degraded mode warnings
- Assumption expiry system (6-month auto-flag)
- Multi-node awareness with independent revocation
- Solo mode — weekly 4h ANIMA-free blocks
- Mem0 graph memory backend

---

## Design Principles

| Principle | Meaning |
|---|---|
| Visible Influence | Every ANIMA decision is inspectable |
| Reversible Authority | Power is easy to revoke |
| Plural Inputs | No single model/node monopoly |
| Continuity with Decay | Useful memory persists, stale memory weakens |
| Assistance not Replacement | Strengthens your agency, never substitutes it |

---

*The most dangerous cage is the one that feels like a nervous system you no longer want to live without.*
