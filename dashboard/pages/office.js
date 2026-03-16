import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import Layout from '../components/Layout';
import AgentTeamBar from '../components/office/AgentTeamBar';
import OfficeKanban from '../components/office/OfficeKanban';
import ChatPanel from '../components/office/ChatPanel';
import DecisionBoard from '../components/office/DecisionBoard';
import {
  fetchFractalState,
  fetchTaskQueue,
  fetchDecisions,
  updateTaskStatus,
  resolveDecision,
  subscribeToTable,
} from '../lib/supabase';

// PixiJS uses WebGL — must be loaded client-side only
const PixelOffice = dynamic(
  () => import('../components/office/PixelOffice'),
  { ssr: false, loading: () => (
    <div className="w-full h-full min-h-[300px] bg-[#0a0a12] rounded-lg border border-anima-border flex items-center justify-center">
      <span className="text-xs text-anima-text-secondary animate-pulse">Loading Pixel Office...</span>
    </div>
  )}
);

export default function OfficePage() {
  const [agents, setAgents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState('kanban'); // kanban | chat | decisions

  // Load all data
  const loadData = useCallback(async () => {
    try {
      const [agentData, taskData, decisionData] = await Promise.allSettled([
        fetchFractalState(),
        fetchTaskQueue(),
        fetchDecisions(),
      ]);
      if (agentData.status === 'fulfilled') setAgents(agentData.value);
      if (taskData.status === 'fulfilled') setTasks(taskData.value);
      if (decisionData.status === 'fulfilled') setDecisions(decisionData.value);
    } catch (e) {
      console.error('Office data load failed:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Realtime subscriptions
    const unsubs = [
      subscribeToTable('anima_fractal_state', () => {
        fetchFractalState().then(setAgents).catch(console.error);
      }),
      subscribeToTable('anima_task_queue', () => {
        fetchTaskQueue().then(setTasks).catch(console.error);
      }),
      subscribeToTable('anima_agent_logs', () => {
        fetchDecisions().then(setDecisions).catch(console.error);
      }),
    ];

    return () => unsubs.forEach(fn => fn());
  }, [loadData]);

  // Kanban drag handler
  async function handleMoveTask(taskId, newStatus) {
    try {
      await updateTaskStatus(taskId, newStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    } catch (e) {
      console.error('Failed to move task:', e);
    }
  }

  // Decision handlers
  async function handleApprove(logId) {
    try {
      await resolveDecision(logId, true);
      setDecisions(prev => prev.filter(d => d.id !== logId));
    } catch (e) {
      console.error('Failed to approve:', e);
    }
  }

  async function handleReject(logId) {
    try {
      await resolveDecision(logId, false);
      setDecisions(prev => prev.filter(d => d.id !== logId));
    } catch (e) {
      console.error('Failed to reject:', e);
    }
  }

  const systemState = agents.length > 0
    ? agents.some(a => a.status === 'EVOLVING') ? 'EVOLVING'
      : agents.some(a => a.status === 'HEALING') ? 'HEALING'
      : agents.every(a => a.status === 'DORMANT') ? 'DORMANT'
      : 'ALIVE'
    : 'DORMANT';

  const avgVitality = agents.length > 0
    ? agents.reduce((sum, a) => sum + (parseFloat(a.vitality_score) || 0), 0) / agents.length
    : 0;

  const PANELS = [
    { key: 'kanban', label: 'Tasks', icon: '\u2637' },
    { key: 'chat', label: 'Chat', icon: '\u2709' },
    { key: 'decisions', label: 'Decisions', icon: '\u2694', badge: decisions.filter(d => !d.immune_scan_result?.resolved).length },
  ];

  return (
    <Layout systemState={systemState} vitalityScore={avgVitality}>
      <Head>
        <title>ANIMA OS — Pixel Office</title>
      </Head>

      <div className="h-screen flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-4 py-3 border-b border-anima-border flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-lg font-bold text-anima-text">Pixel Office</h1>
            <p className="text-[10px] text-anima-text-secondary font-mono">
              {agents.length} agents | {tasks.filter(t => t.status === 'RUNNING').length} active tasks | {systemState}
            </p>
          </div>
          <div className="flex items-center gap-1">
            {PANELS.map(p => (
              <button
                key={p.key}
                onClick={() => setActivePanel(p.key)}
                className={`relative px-3 py-1.5 text-xs rounded transition-colors ${
                  activePanel === p.key
                    ? 'bg-anima-gold/20 text-anima-gold border border-anima-gold/30'
                    : 'text-anima-text-secondary hover:text-anima-text hover:bg-white/5'
                }`}
              >
                <span className="mr-1">{p.icon}</span>
                {p.label}
                {p.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] rounded-full flex items-center justify-center">
                    {p.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main content */}
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-anima-gold border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Agent Team Bar */}
            <div className="w-[220px] shrink-0 border-r border-anima-border p-3 overflow-y-auto hidden lg:block">
              <AgentTeamBar agents={agents} />
            </div>

            {/* Center: Pixel Office + Bottom Panel */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Pixel Office Canvas */}
              <div className="flex-1 p-3 min-h-0">
                <PixelOffice agents={agents} tasks={tasks} />
              </div>

              {/* Bottom Panel */}
              <div className="h-[280px] shrink-0 border-t border-anima-border p-3 overflow-hidden">
                {activePanel === 'kanban' && (
                  <OfficeKanban tasks={tasks} onMoveTask={handleMoveTask} />
                )}
                {activePanel === 'chat' && (
                  <ChatPanel />
                )}
                {activePanel === 'decisions' && (
                  <DecisionBoard
                    decisions={decisions}
                    onApprove={handleApprove}
                    onReject={handleReject}
                  />
                )}
              </div>
            </div>

            {/* Right: Mobile Agent Bar (shown on smaller screens as bottom sheet) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-anima-bg border-t border-anima-border p-2 z-20">
              <div className="flex gap-2 overflow-x-auto">
                {agents.slice(0, 6).map(agent => (
                  <div
                    key={agent.branch_id || agent.name}
                    className="shrink-0 bg-anima-bg-card rounded px-2 py-1 border border-anima-border"
                  >
                    <span className="text-[9px] font-mono text-anima-gold">
                      {(agent.branch_id || agent.name || '').slice(0, 10)}
                    </span>
                    <span className="text-[9px] ml-1" style={{ color: agent.status === 'ALIVE' ? '#00ff88' : '#888' }}>
                      {agent.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
