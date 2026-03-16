import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// /api/chat — Enqueue a chat message to ROOT_ORCHESTRATOR
// Creates a task in anima_task_queue with type CUSTOM
// Returns confirmation (async processing by runtime)
// ═══════════════════════════════════════════════════════════════════

const MASTER_UUID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  try {
    // Create task in queue for ROOT_ORCHESTRATOR
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

    if (taskError) throw taskError;

    // Also log the chat event
    await supabase.from('anima_agent_logs').insert({
      agent_name: 'ROOT_ORCHESTRATOR',
      task_description: `Chat: ${message.trim().slice(0, 200)}`,
      mission_alignment: 0.5,
      user_id: MASTER_UUID,
    });

    return res.status(200).json({
      reply: `Message received. Task #${task.id.slice(0, 8)} queued to ROOT_ORCHESTRATOR with priority 7. The runtime will process this on the next π-pulse cycle.`,
      taskId: task.id,
      agent: 'ROOT_ORCHESTRATOR',
      status: 'QUEUED',
    });
  } catch (err) {
    console.error('Chat API error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
