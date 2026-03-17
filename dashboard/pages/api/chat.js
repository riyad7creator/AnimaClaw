import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// /api/chat — Enqueue a chat message to ROOT_ORCHESTRATOR
// Uses service key (falls back to anon key + open RLS policy)
// ═══════════════════════════════════════════════════════════════════

const MASTER_UUID = '00000000-0000-0000-0000-000000000001';

// Build a Supabase client that bypasses RLS as much as possible
function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  // Prefer service key; our fallback is anon key with open RLS policy
  const key = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        // Force service-role header if we have it
        ...(process.env.SUPABASE_SERVICE_KEY ? { 'x-supabase-auth-bypass-rls': '1' } : {}),
      },
    },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const supabase = getAdminClient();

  try {
    // Insert chat task into queue
    const { data: task, error: taskError } = await supabase
      .from('anima_task_queue')
      .insert({
        agent_name: 'ROOT_ORCHESTRATOR',
        task_type: 'CUSTOM',
        task_payload: {
          type: 'CHAT',
          prompt: message.trim(),
          source: 'office_chat',
          timestamp: new Date().toISOString(),
        },
        priority: 7,
        status: 'QUEUED',
        user_id: MASTER_UUID,
      })
      .select()
      .single();

    if (taskError) {
      console.error('Task insert error:', taskError);
      throw taskError;
    }

    // Log the chat event (non-blocking — ignore error)
    await supabase.from('anima_agent_logs').insert({
      agent_name: 'ROOT_ORCHESTRATOR',
      task_description: `Chat: ${message.trim().slice(0, 200)}`,
      mission_alignment: 0.5,
      user_id: MASTER_UUID,
      model_used: 'chat_input',
    }).then(({ error }) => {
      if (error) console.warn('Log insert warning:', error.message);
    });

    return res.status(200).json({
      reply: `Message received. Task #${task.id.slice(0, 8)} queued to ROOT_ORCHESTRATOR — priority 7. Will process on next π-pulse cycle (${Math.ceil(3.14159)} seconds).`,
      taskId: task.id,
      agent: 'ROOT_ORCHESTRATOR',
      status: 'QUEUED',
    });
  } catch (err) {
    console.error('Chat API error:', err);

    // Friendly RLS error message
    if (err.code === '42501' || (err.message && err.message.includes('row-level security'))) {
      return res.status(500).json({
        error: 'RLS_POLICY_MISSING',
        detail: 'Run this SQL in Supabase: CREATE POLICY "anon_all" ON anima_task_queue FOR ALL TO anon USING (true) WITH CHECK (true);',
      });
    }

    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
