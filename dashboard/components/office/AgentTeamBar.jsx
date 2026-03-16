import { CORE_AGENTS, getStatusColor, getVitalityColor } from '../../lib/constants';

// ═══════════════════════════════════════════════════════════════════
// AGENT TEAM BAR — Shows all agents with vitality + status
// ═══════════════════════════════════════════════════════════════════

const SPECIALIZATIONS = {
  ROOT_ORCHESTRATOR: 'Routes all tasks via φ-weighted scoring',
  PRIMARY_CELL: 'Executes 61.8% of mission-critical work',
  SUPPORT_CELL: 'Monitoring, memory, and support tasks',
  MEMORY_NODE: 'Persistent storage and context retrieval',
  EVOLUTION_NODE: 'Behavioral learning and SOUL.md mutation',
  IMMUNE_AGENT: 'Security scanning and threat detection',
};

export default function AgentTeamBar({ agents = [] }) {
  // Merge DB data with static registry
  const merged = CORE_AGENTS.map(ca => {
    const dbAgent = agents.find(a => (a.branch_id || a.name) === ca.name);
    return {
      name: ca.name,
      role: ca.role,
      depth: ca.depth,
      phiWeight: ca.phiWeight,
      specialization: SPECIALIZATIONS[ca.name],
      vitality: dbAgent ? parseFloat(dbAgent.vitality_score) || 0 : 0,
      status: dbAgent?.status || 'DORMANT',
      lastHeartbeat: dbAgent?.last_heartbeat,
    };
  });

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-anima-text-secondary uppercase tracking-wider mb-3">
        Agent Team
      </h3>
      {merged.map(agent => {
        const statusColor = getStatusColor(agent.status);
        const vitalityColor = getVitalityColor(agent.vitality);
        const vitalityPct = Math.min(100, agent.vitality * 100);

        return (
          <div
            key={agent.name}
            className="bg-anima-bg-card rounded border border-anima-border p-3 hover:border-anima-gold/30 transition-colors"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono font-bold text-anima-text truncate">
                {agent.name}
              </span>
              <span
                className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                style={{ backgroundColor: statusColor + '20', color: statusColor }}
              >
                {agent.status}
              </span>
            </div>
            <p className="text-[10px] text-anima-text-secondary mb-2">{agent.role}</p>

            {/* Vitality bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${vitalityPct}%`, backgroundColor: vitalityColor }}
                />
              </div>
              <span className="text-[10px] font-mono" style={{ color: vitalityColor }}>
                {agent.vitality.toFixed(3)}
              </span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mt-1.5 text-[9px] font-mono text-anima-text-secondary">
              <span>d{agent.depth}</span>
              <span>φ{agent.phiWeight}</span>
              {agent.lastHeartbeat && (
                <span className="ml-auto">
                  {timeAgo(agent.lastHeartbeat)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  if (diff < 60000) return `${Math.floor(diff / 1000)}s ago`;
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}
