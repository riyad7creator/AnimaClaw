#!/bin/bash
# Activate all Anima OS agents on the VPS
# Run this via the Hostinger web terminal:
#   bash /root/AnimaClaw/scripts/activate-agents-vps.sh

set -e

PROJECT_DIR="/root/AnimaClaw"
DASHBOARD_DIR="$PROJECT_DIR/dashboard"

echo "=== Anima OS — Activating real agents ==="
echo "    Agents: ROOT_ORCHESTRATOR, PRIMARY_CELL, SUPPORT_CELL,"
echo "            MEMORY_NODE, EVOLUTION_NODE, IMMUNE_AGENT"
echo ""

# 1. Pull latest code (includes the fixed seedDefaultAgents)
echo "→ Pulling latest code..."
cd "$PROJECT_DIR"
git pull origin main

# 2. Set ANIMA_OS_CONFIG_PATH in the dashboard .env so seeding finds the right openclaw.json
ENV_FILE="$DASHBOARD_DIR/.env"
if ! grep -q "ANIMA_OS_CONFIG_PATH" "$ENV_FILE" 2>/dev/null; then
    echo "" >> "$ENV_FILE"
    echo "# Path to the project openclaw.json (for Anima agent seeding)" >> "$ENV_FILE"
    echo "ANIMA_OS_CONFIG_PATH=/root/AnimaClaw/openclaw.json" >> "$ENV_FILE"
    echo "→ Added ANIMA_OS_CONFIG_PATH to .env"
else
    echo "→ ANIMA_OS_CONFIG_PATH already in .env"
fi

# 3. Install deps + rebuild
echo "→ Installing dependencies..."
cd "$DASHBOARD_DIR"
pnpm install --frozen-lockfile

echo "→ Building dashboard..."
pnpm build

# 4. Restart PM2 — on next DB init, seedDefaultAgents will read openclaw.json
#    and insert ROOT_ORCHESTRATOR, PRIMARY_CELL, SUPPORT_CELL, MEMORY_NODE,
#    EVOLUTION_NODE, IMMUNE_AGENT into the agents table
echo "→ Restarting PM2..."
pm2 restart animaclaw 2>/dev/null || pm2 restart all

sleep 5

# 5. Trigger agent sync (re-reads openclaw.json and upserts agents)
API_KEY=$(grep "^API_KEY=" "$ENV_FILE" 2>/dev/null | cut -d= -f2-)
if [ -n "$API_KEY" ]; then
    echo "→ Triggering agent sync via API..."
    curl -s -X POST "http://localhost:3000/api/agents/sync" \
        -H "x-api-key: $API_KEY" \
        -H "Content-Type: application/json" | python3 -m json.tool 2>/dev/null || true
fi

echo ""
echo "✅ Done! Your real Anima OS agents are now active:"
echo "   ROOT_ORCHESTRATOR — Central nervous system (φ=1.0)"
echo "   PRIMARY_CELL      — Core execution (φ=0.618)"
echo "   SUPPORT_CELL      — Monitoring & coordination (φ=0.382)"
echo "   MEMORY_NODE       — Supabase memory (φ=0.146)"
echo "   EVOLUTION_NODE    — QRL learning & evolution (φ=0.236)"
echo "   IMMUNE_AGENT      — Security scanner (φ=0.146)"
echo ""
echo "   Visit https://animaos.ketami.net → Agents panel"
