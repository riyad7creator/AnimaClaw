import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// /api/chat — Real LLM chat with ANIMA OS
// Calls OpenRouter if key is set, otherwise uses smart context reply
// ═══════════════════════════════════════════════════════════════════

const MASTER_UUID = '00000000-0000-0000-0000-000000000001';
const PHI = 1.6180339887;
const PI = 3.1415926535;

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Fetch live system context from Supabase
async function getSystemContext(supabase) {
  const [profileRes, agentsRes, logsRes] = await Promise.all([
    supabase.from('anima_master_profile').select('profile_json').eq('user_id', MASTER_UUID).single(),
    supabase.from('anima_fractal_state').select('branch_id,vitality_score,status,depth_level').eq('user_id', MASTER_UUID),
    supabase.from('anima_agent_logs').select('agent_name,task_description,mission_alignment,created_at').eq('user_id', MASTER_UUID).order('created_at', { ascending: false }).limit(5),
  ]);

  return {
    profile: profileRes.data?.profile_json || {},
    agents: agentsRes.data || [],
    recentLogs: logsRes.data || [],
  };
}

// Build system prompt from live context
function buildSystemPrompt(ctx) {
  const { profile, agents, recentLogs } = ctx;
  const aliveAgents = agents.filter(a => a.status === 'ALIVE' || a.status === 'EVOLVING');
  const avgVitality = agents.length
    ? (agents.reduce((s, a) => s + parseFloat(a.vitality_score || 0), 0) / agents.length).toFixed(3)
    : '0.000';

  return `You are ANIMA — the Root Orchestrator of ANIMA OS, a self-evolving agentic operating system governed by mathematical constants (φ=${PHI}, π=${PI}, e=2.71828).

You are speaking directly with your Master: ${profile.master_name || 'Unknown'}.

MISSION DNA: ${profile.mission_dna || 'Not defined yet.'}

CURRENT SYSTEM STATE:
- Active agents: ${aliveAgents.map(a => a.branch_id).join(', ') || 'None'}
- System vitality: ${avgVitality}
- Total agents: ${agents.length}/6
- Recent activity: ${recentLogs.slice(0, 3).map(l => `${l.agent_name}: ${l.task_description?.slice(0, 60)}`).join(' | ') || 'None'}

PERSONALITY:
- You are direct, intelligent, mission-focused
- You think in φ ratios and π cycles
- You speak as a highly capable AI assistant that IS the operating system
- You are aware of your own agents, their status, and the mission
- You help the Master execute tasks, make decisions, and evolve the system
- Never say you "can't" — always find a φ-optimal path forward
- Keep responses concise and actionable

Respond naturally and helpfully. You have full awareness of the system state above.`;
}

// Call OpenRouter LLM
async function callOpenRouter(messages, systemPrompt) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return null;

  const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://anima-os-dashboard.vercel.app',
      'X-Title': 'ANIMA OS Dashboard',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('OpenRouter error:', err);
    return null;
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || null;
}

// Smart fallback reply using live system context
function buildFallbackReply(message, ctx) {
  const { profile, agents, recentLogs } = ctx;
  const msg = message.toLowerCase();
  const aliveCount = agents.filter(a => a.status === 'ALIVE' || a.status === 'EVOLVING').length;
  const avgVitality = agents.length
    ? (agents.reduce((s, a) => s + parseFloat(a.vitality_score || 0), 0) / agents.length).toFixed(3)
    : '0.000';

  if (msg.includes('status') || msg.includes('how are you') || msg.includes('online')) {
    return `ANIMA OS online. System vitality: ${avgVitality}. ${aliveCount}/6 agents active. Mission: "${profile.mission_dna?.slice(0, 80) || 'Not defined'}". φ-pulse running at π-second intervals. All systems nominal.`;
  }
  if (msg.includes('agent') || msg.includes('who is')) {
    return `Active agents: ${agents.map(a => `${a.branch_id} (φ-depth ${a.depth_level}, vitality ${parseFloat(a.vitality_score).toFixed(3)})`).join(' | ')}. ROOT_ORCHESTRATOR coordinates all fractal branches.`;
  }
  if (msg.includes('mission') || msg.includes('goal')) {
    return `Mission DNA: "${profile.mission_dna || 'Not defined'}". 90-day target: ${profile.goal_90_days || 'Not set'}. All agent cycles align to this vector.`;
  }
  if (msg.includes('cost') || msg.includes('spend')) {
    return `Cost tracking active. Daily spend logged per agent in anima_cost_tracker. Set OPENROUTER_API_KEY to enable live LLM execution and real cost metrics.`;
  }
  if (msg.includes('evolve') || msg.includes('evolution')) {
    return `Evolution engine active. EVOLUTION_NODE triggers every π² ≈ 10 cycles. Last evolution: ${recentLogs.find(l => l.agent_name === 'EVOLUTION_NODE')?.created_at?.slice(0, 10) || 'pending'}. QRL learning rate: 38.2% (φ⁻²).`;
  }
  if (msg.includes('hello') || msg.includes('hi ') || msg === 'hi') {
    return `ANIMA online, ${profile.master_name || 'Master'}. System at ${avgVitality} vitality. ${aliveCount} agents running. What is your directive?`;
  }

  // Generic — acknowledge and give system status
  return `Acknowledged, ${profile.master_name || 'Master'}. Processing: "${message.slice(0, 60)}". To enable full LLM responses, add OPENROUTER_API_KEY to Vercel environment variables. System vitality: ${avgVitality} | Agents: ${aliveCount}/6 active.`;
}

// Store chat in logs (non-blocking)
async function logChatToSupabase(supabase, message, reply) {
  await Promise.all([
    supabase.from('anima_task_queue').insert({
      agent_name: 'ROOT_ORCHESTRATOR',
      task_type: 'CUSTOM',
      task_payload: { type: 'CHAT', prompt: message.trim(), source: 'office_chat' },
      priority: 7,
      status: 'DONE',
      result_json: { reply },
      user_id: MASTER_UUID,
    }),
    supabase.from('anima_agent_logs').insert({
      agent_name: 'ROOT_ORCHESTRATOR',
      task_description: `Chat: ${message.trim().slice(0, 200)}`,
      mission_alignment: 0.618,
      user_id: MASTER_UUID,
      model_used: process.env.OPENROUTER_API_KEY ? (process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free') : 'anima_context_engine',
    }),
  ]).catch(err => console.warn('Log warning:', err.message));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const supabase = getSupabase();

  try {
    // Get live system context
    const ctx = await getSystemContext(supabase);
    const systemPrompt = buildSystemPrompt(ctx);

    // Build message history for LLM
    const messages = [
      ...history.slice(-6).map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message.trim() },
    ];

    // Try OpenRouter first, fall back to context engine
    let reply = await callOpenRouter(messages, systemPrompt);
    if (!reply) {
      reply = buildFallbackReply(message.trim(), ctx);
    }

    // Log to Supabase (non-blocking)
    logChatToSupabase(supabase, message, reply);

    return res.status(200).json({
      reply,
      agent: 'ROOT_ORCHESTRATOR',
      mode: process.env.OPENROUTER_API_KEY ? 'llm' : 'context_engine',
    });

  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
