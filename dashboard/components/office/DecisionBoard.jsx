import { COLORS } from '../../lib/constants';

// ═══════════════════════════════════════════════════════════════════
// DECISION BOARD — Approve/Reject flagged decisions
// Shows items from IMMUNE_AGENT / EVOLUTION_NODE
// ═══════════════════════════════════════════════════════════════════

const SEVERITY_COLORS = {
  CRITICAL: COLORS.red,
  HIGH: '#ff8844',
  MEDIUM: COLORS.gold,
  LOW: COLORS.blue,
};

export default function DecisionBoard({ decisions = [], onApprove, onReject }) {
  const pending = decisions.filter(d => {
    const scan = d.immune_scan_result;
    return !scan?.resolved;
  });

  return (
    <div className="bg-anima-bg-card rounded-lg border border-anima-border p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-anima-text">Decision Board</h3>
        {pending.length > 0 && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-900/30 text-red-400">
            {pending.length} pending
          </span>
        )}
      </div>

      {pending.length === 0 ? (
        <div className="text-center py-6 text-xs text-anima-text-secondary">
          No decisions require approval.
          <br />
          <span className="text-anima-text-secondary/50">
            IMMUNE_AGENT flags threats here for review.
          </span>
        </div>
      ) : (
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {pending.map(decision => {
            const severity = decision.threat_severity || 'MEDIUM';
            const sevColor = SEVERITY_COLORS[severity] || COLORS.gold;

            return (
              <div
                key={decision.id}
                className="bg-anima-bg rounded p-3 border border-anima-border"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-anima-gold">
                    {decision.agent_name}
                  </span>
                  <span
                    className="text-[9px] font-mono px-1 py-0.5 rounded"
                    style={{ backgroundColor: sevColor + '20', color: sevColor }}
                  >
                    {severity}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-anima-text mb-2">
                  {decision.task_description || 'Threat detected — review required'}
                </p>

                {/* Scan details */}
                {decision.immune_scan_result && (
                  <p className="text-[10px] text-anima-text-secondary mb-2">
                    {typeof decision.immune_scan_result === 'string'
                      ? decision.immune_scan_result
                      : JSON.stringify(decision.immune_scan_result).slice(0, 120)}
                  </p>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => onApprove?.(decision.id)}
                    className="flex-1 text-[10px] py-1 rounded bg-green-900/30 text-green-400 border border-green-800/30 hover:bg-green-900/50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onReject?.(decision.id)}
                    className="flex-1 text-[10px] py-1 rounded bg-red-900/30 text-red-400 border border-red-800/30 hover:bg-red-900/50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
