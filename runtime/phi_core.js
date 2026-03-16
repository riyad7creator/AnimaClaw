/**
 * PHI CORE — φ-Weighted Routing Engine
 * Governs all task routing decisions in ANIMA OS.
 *
 * Every task passes through phi_core before execution.
 * Scoring: phi_score = task_complexity × phi_weight × mission_alignment
 * 
 * NOTE: All constants imported from natural_law.js - single source of truth.
 */

const {
  PHI,
  PI,
  E,
  PHI_PRIMARY,
  PHI_SECONDARY,
  AGENT_REGISTRY,
  VITALITY_MAINTAIN,
  VITALITY_CRITICAL,
  calculateVitality,
  harmonicBridge,
  allocateResources,
} = require('./natural_law');

/**
 * Score a task-agent pairing.
 */
function scoreAssignment(task, agent) {
  const complexity = task.complexity || 5;
  const urgency = task.urgency || 0.5;
  const alignment = task.mission_alignment || 0.5;
  const agentVitality = agent.vitality_score || 0.5;

  const rawScore = (complexity / 10) * urgency * alignment * agent.phi_weight;
  const depthPenalty = 1.0 / (1 + agent.depth * 0.1);
  const capacityFactor = 1.0 - ((agent.current_load || 0) / (agent.max_capacity || 10));
  const vitalityBonus = agentVitality > VITALITY_MAINTAIN ? 1.0 : agentVitality;

  return rawScore * depthPenalty * capacityFactor * vitalityBonus;
}

/**
 * Apply interference (Law 8) to a raw score.
 */
function applyInterference(rawScore) {
  if (rawScore > VITALITY_MAINTAIN) {
    return { score: Math.min(rawScore * PHI, 1.618), type: 'CONSTRUCTIVE' };
  }
  return { score: rawScore * VITALITY_CRITICAL, type: 'DESTRUCTIVE' };
}

/**
 * Route a single task to the best available agent.
 */
function routeTask(task, agents) {
  let bestAgent = null;
  let bestScore = -1;
  let bestInterference = null;

  for (const agent of agents) {
    if (agent.status === 'PRUNED' || agent.status === 'QUARANTINED') continue;
    if ((agent.vitality_score || 0) < VITALITY_CRITICAL) continue;

    const raw = scoreAssignment(task, agent);
    const { score, type } = applyInterference(raw);

    if (score > bestScore) {
      bestScore = score;
      bestAgent = agent;
      bestInterference = type;
    }
  }

  return {
    agent: bestAgent?.branch_id || bestAgent?.name || null,
    score: bestScore,
    interference: bestInterference,
    raw_score: bestScore > 0 ? (bestInterference === 'CONSTRUCTIVE' ? bestScore / PHI : bestScore / VITALITY_CRITICAL) : 0,
  };
}

/**
 * QAOA routing — assign multiple tasks to multiple agents optimally (Law 11).
 */
function qaoaRoute(tasks, agents) {
  const assignmentMatrix = {};

  // Score all pairings
  for (const task of tasks) {
    for (const agent of agents) {
      if (agent.status !== 'ALIVE' && agent.status !== 'HEALING') continue;
      if ((agent.vitality_score || 0) < VITALITY_CRITICAL) continue;

      const raw = scoreAssignment(task, agent);
      const { score, type } = applyInterference(raw);

      const key = `${task.id}:${agent.branch_id || agent.name}`;
      assignmentMatrix[key] = {
        task_id: task.id,
        agent_name: agent.branch_id || agent.name,
        score,
        raw_score: raw,
        interference: type,
        agent_vitality: agent.vitality_score,
        agent_load: agent.current_load || 0,
      };
    }
  }

  // Sort by score descending
  const sorted = Object.values(assignmentMatrix).sort((a, b) => b.score - a.score);

  const assignedTasks = new Set();
  const agentTaskCount = {};
  const finalAssignments = [];

  for (const entry of sorted) {
    if (assignedTasks.has(entry.task_id)) continue;

    const count = agentTaskCount[entry.agent_name] || 0;
    const agentDef = AGENT_REGISTRY[entry.agent_name];
    const maxTasks = (agentDef?.phi_weight || 0) >= VITALITY_MAINTAIN
      ? Math.ceil(tasks.length * PHI_PRIMARY)
      : Math.ceil(tasks.length * PHI_SECONDARY);

    if (count >= maxTasks) continue;

    finalAssignments.push(entry);
    assignedTasks.add(entry.task_id);
    agentTaskCount[entry.agent_name] = count + 1;
  }

  return {
    assignments: finalAssignments,
    total_tasks: tasks.length,
    total_agents: agents.length,
    pairings_evaluated: Object.keys(assignmentMatrix).length,
    unassigned: tasks.length - assignedTasks.size,
  };
}

// Re-export natural law constants for backward compatibility
module.exports = {
  // From natural_law
  PHI,
  PI,
  E,
  PHI_PRIMARY,
  PHI_SECONDARY,
  AGENT_REGISTRY,
  VITALITY_MAINTAIN,
  VITALITY_CRITICAL,
  calculateVitality,
  harmonicBridge,
  allocateResources,
  
  // Phi core specific
  scoreAssignment,
  applyInterference,
  routeTask,
  qaoaRoute,
};
