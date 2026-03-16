import { createClient } from '@supabase/supabase-js';

// ═══════════════════════════════════════════════════════════════════
// /api/decisions — Approve/Reject flagged decisions
// ═══════════════════════════════════════════════════════════════════

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { logId, approved } = req.body;
  if (!logId) {
    return res.status(400).json({ error: 'logId is required' });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  try {
    const { data, error } = await supabase
      .from('anima_agent_logs')
      .update({
        immune_scan_result: {
          resolved: true,
          approved: !!approved,
          resolved_at: new Date().toISOString(),
          resolved_by: 'master',
        },
      })
      .eq('id', logId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('Decisions API error:', err);
    return res.status(500).json({ error: err.message || 'Internal error' });
  }
}
