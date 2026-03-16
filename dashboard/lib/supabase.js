import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'ANIMA OS: Supabase credentials not configured. ' +
    'Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export async function fetchAgentLogs(filters = {}) {
  let query = supabase
    .from('anima_agent_logs')
    .select('*')
    .is('archived_at', null)
    .order('pi_pulse_timestamp', { ascending: false });

  if (filters.agentName) query = query.eq('agent_name', filters.agentName);
  if (filters.limit) query = query.limit(filters.limit);
  if (filters.sinceCycle) query = query.gte('cycle_number', filters.sinceCycle);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function fetchFractalState() {
  const { data, error } = await supabase
    .from('anima_fractal_state')
    .select('*')
    .order('depth_level', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function fetchEvolutionLog(limit = 50) {
  const { data, error } = await supabase
    .from('anima_evolution_log')
    .select('*')
    .order('cycle_number', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data || [];
}

export async function fetchCostData(dateRange = 'daily') {
  const { data, error } = await supabase
    .from('anima_cost_tracker')
    .select('*')
    .order('date', { ascending: false })
    .limit(dateRange === 'daily' ? 30 : dateRange === 'weekly' ? 12 : 365);

  if (error) throw error;
  return data || [];
}

export async function fetchMasterProfile() {
  const { data, error } = await supabase
    .from('anima_master_profile')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ═══════════════════════════════════════════════════════════════════
// TASK QUEUE (Office / Kanban)
// ═══════════════════════════════════════════════════════════════════

export async function fetchTaskQueue() {
  const { data, error } = await supabase
    .from('anima_task_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(100);

  if (error) throw error;
  return data || [];
}

export async function updateTaskStatus(taskId, status) {
  const updates = { status };
  if (status === 'RUNNING') updates.started_at = new Date().toISOString();
  if (status === 'DONE' || status === 'FAILED') updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('anima_task_queue')
    .update(updates)
    .eq('id', taskId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createTask({ agent_name, task_type, task_payload, priority, user_id }) {
  const { data, error } = await supabase
    .from('anima_task_queue')
    .insert({
      agent_name: agent_name || 'ROOT_ORCHESTRATOR',
      task_type: task_type || 'LLM_CALL',
      task_payload: task_payload || {},
      priority: priority || 5,
      status: 'QUEUED',
      user_id: user_id || '00000000-0000-0000-0000-000000000001',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ═══════════════════════════════════════════════════════════════════
// DECISIONS (Office / Approval Board)
// ═══════════════════════════════════════════════════════════════════

export async function fetchDecisions() {
  const { data, error } = await supabase
    .from('anima_agent_logs')
    .select('*')
    .eq('threat_detected', true)
    .is('archived_at', null)
    .order('pi_pulse_timestamp', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data || [];
}

export async function resolveDecision(logId, approved) {
  const { data, error } = await supabase
    .from('anima_agent_logs')
    .update({
      immune_scan_result: { resolved: true, approved, resolved_at: new Date().toISOString() },
    })
    .eq('id', logId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export function subscribeToTable(table, callback) {
  const channel = supabase
    .channel(`anima-${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => callback(payload)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}
