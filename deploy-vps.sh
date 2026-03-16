#!/bin/bash
# ╔══════════════════════════════════════════════════════════════════╗
# ║  ANIMA CLAW v1.4.0 — VPS Deployment Script                      ║
# ║  Engine: SOLARIS | Theme: Green Pixel Cyborg                    ║
# ║  Target: Alibaba Cloud Ubuntu 24.04                              ║
# ╚══════════════════════════════════════════════════════════════════╝

set -euo pipefail

# Colors
GREEN='\033[0;32m'
GOLD='\033[1;33m'
RESET='\033[0m'

echo -e "${GREEN}🧬 ANIMA CLAW v1.4.0 — VPS Deployment${RESET}"
echo "═══════════════════════════════════════════════════════════════"

# Clean install
cd ~
rm -rf AnimaClaw
git clone https://github.com/riyad7creator/AnimaClaw.git ~/AnimaClaw
cd ~/AnimaClaw

echo -e "\n${GOLD}[1/7] Setting up Green Cyborg Theme...${RESET}"
cat > dashboard/lib/constants.js << 'EOF'
export const COLORS = {
  background: '#0a0a0a',
  'bg-card': '#001a00',
  'bg-light': '#002200',
  gold: '#00ff88',
  text: '#e0ffe0', 
  'text-dim': '#88cc88',
  border: '#004400'
};
EOF

echo -e "\n${GOLD}[2/7] Creating Pixel Cyborg Claw Welcome Screen...${RESET}"
cat > setup/vps-welcome.js << 'EOF'
#!/usr/bin/env node
console.clear();
console.log(`
    ▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
   █░░░░░░░░░░░░░░░░░░░░░░░░█
   █░░▄▀▀▀▀▀▄▀▀▀▀▀▄▀▀▀▀▀▄░░█    ANIMA CLAW
   █░░█▄▄▄▄█▄▄▄▄█▄▄▄▄█▄▄▄▄█░░█   v1.4.0 - CYBORG SWARM
   █░░▀░░░░▀░░░░▀░░░░▀░░░░▀░░█
    ▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀▀
     ||||||||||||||||| |||||
     NEON GREEN CYBER CLAW
     
  ✅ Alibaba Cloud VPS: 47.84.5.176
  🌀 π Pulse: ${Math.PI.toFixed(4)}s heartbeat
  🔗 Dashboard: https://anima-os-dashboard.vercel.app
  ⚡ Kimi Claw Gateway: localhost:18789
`);
EOF
chmod +x setup/vps-welcome.js

echo -e "\n${GOLD}[3/7] Creating Memory Export Prompt...${RESET}"
cat > onboarding/memory_export_prompt.txt << 'EOF'
Export all of my stored memories and any context you've learned about me from past conversations. Preserve my words verbatim where possible, especially for instructions and preferences.

## Categories (output in this order):

1. **Instructions**: Rules I've explicitly asked you to follow going forward — tone, format, style, "always do X", "never do Y", and corrections to your behavior. Only include rules from stored memories, not from conversations.

2. **Identity**: Name, age, location, education, family, relationships, languages, and personal interests.

3. **Career**: Current and past roles, companies, and general skill areas.

4. **Projects**: Projects I meaningfully built or committed to. Ideally ONE entry per project. Include what it does, current status, and any key decisions. Use the project name or a short descriptor as the first words of the entry.

5. **Preferences**: Opinions, tastes, and working-style preferences that apply broadly.

## Format:
Use section headers for each category. Within each category, list one entry per line, sorted by oldest date first. Format each line as: [YYYY-MM-DD] - Entry content here. If no date is known, use [unknown] instead.

## Output:
- Wrap the entire export in a single code block for easy copying.
- After the code block, state whether this is the complete set or if more remain.
EOF

echo -e "\n${GOLD}[4/7] Creating Interactive Setup Wizard...${RESET}"
cat > setup/wizard.js << 'WIZARDEOF'
#!/usr/bin/env node
const readline = require('readline');
const fs = require('fs');
const { execSync } = require('child_process');
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

console.clear();
console.log('🧬 ANIMA CLAW v1.4.0 - INTERACTIVE SETUP WIZARD 🧬');
console.log('═══════════════════════════════════════════════════════════════\n');

async function ask(question, optional = false) {
  const defaultVal = optional ? '[SKIP]' : '';
  return new Promise(resolve => {
    rl.question(`${optional ? '[OPTIONAL] ' : ''}${question} ${defaultVal}: `, resolve);
  });
}

async function main() {
  console.log('🔑 STEP 1: SUPABASE (Database)\n');
  console.log('   📖 Docs: https://supabase.com/dashboard → Settings → API');
  console.log('   🔑 Copy: Project URL, anon/public key, service_role key\n');
  
  const supabaseUrl = await ask('SUPABASE_URL (https://xyz.supabase.co)');
  const supabaseAnon = await ask('SUPABASE_ANON_KEY (eyJ...)');
  const supabaseService = await ask('SUPABASE_SERVICE_KEY (sbp...)');
  
  console.log('\n🌐 STEP 2: VERCEL (Dashboard)\n');
  console.log('   📖 Docs: vercel.com/account/tokens → Create Token');
  const vercelToken = await ask('VERCEL_TOKEN');
  
  console.log('\n🔔 STEP 3: DISCORD BOT (Optional Notifications)\n');
  console.log('   📖 Docs: discord.com/developers → New App → Bot → Token');
  const discordBot = await ask('DISCORD_BOT_TOKEN', true);
  const discordGuild = discordBot ? await ask('DISCORD_GUILD_ID (Server ID)', true) : '';
  
  console.log('\n📊 STEP 4: OPENROUTER (AI)\n');
  console.log('   📖 Docs: openrouter.ai → Credits → API Keys');
  const openrouterKey = await ask('OPENROUTER_API_KEY', true);
  
  // Create secure .env
  const env = `SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnon}
SUPABASE_SERVICE_KEY=${supabaseService}
VERCEL_TOKEN=${vercelToken}
${discordBot ? `DISCORD_BOT_TOKEN=${discordBot}` : ''}
${discordGuild ? `DISCORD_GUILD_ID=${discordGuild}` : ''}
${openrouterKey ? `OPENROUTER_API_KEY=${openrouterKey}` : ''}
PI_PULSE_INTERVAL=3141
`.trim();
  
  fs.writeFileSync('.env', env);
  fs.chmodSync('.env', 0o600);
  
  console.log('\n✅ .env created securely (chmod 600)');
  
  // Auto deploy
  console.log('\n🚀 STEP 5: AUTO DEPLOYING...\n');
  execSync('npm ci && npm i -g pm2', { stdio: 'inherit' });
  execSync('pm2 delete all 2>/dev/null || true', { stdio: 'inherit' });
  execSync('pm2 start setup/pi_pulse_daemon.js --name AnimaClaw -- start', { stdio: 'inherit' });
  execSync('pm2 save && pm2 startup systemd', { stdio: 'inherit' });
  
  // Dashboard setup
  console.log('\n🌐 STEP 6: DASHBOARD...\n');
  execSync('cd dashboard && npm ci && npm run build', { stdio: 'inherit' });
  
  console.log('\n🎉 ANIMA CLAW FULLY DEPLOYED!');
  console.log('\n📱 NEXT STEPS:');
  console.log('   1. Dashboard: vercel.com → Deploy AnimaClaw');
  console.log('   2. Test: pm2 logs AnimaClaw');
  console.log('   3. Future updates: ./setup/wizard.js');
  console.log('\n🛡️ SECURITY: Keys stored in ~/AnimaClaw/.env (private)');
}

main().finally(() => rl.close());
WIZARDEOF
chmod +x setup/wizard.js

echo -e "\n${GOLD}[5/7] Installing dependencies...${RESET}"
npm ci && npm i -g pm2

echo -e "\n${GOLD}[6/7] Launching interactive wizard...${RESET}"
./setup/wizard.js

echo -e "\n${GOLD}[7/7] Showing Cyborg Claw welcome...${RESET}"
./setup/vps-welcome.js

echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║                ✅ DEPLOYMENT COMPLETE                         ║"
echo "╠═══════════════════════════════════════════════════════════════╣"
echo "║  🌐 Dashboard: https://anima-os-dashboard.vercel.app          ║"
echo "║  🔧 Update:    cd ~/AnimaClaw && ./setup/wizard.js            ║"
echo "║  🛡️  Security:  chmod 600 ~/AnimaClaw/.env                     ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
