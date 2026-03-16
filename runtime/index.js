/**
 * ANIMA OS Runtime — Unified entry point for all runtime modules.
 * 
 * Usage:
 *   const runtime = require('./runtime');
 *   runtime.calculateVitality(depth, alignment, cycleAge, fractalScore);
 *   runtime.routeTask(task, agents);
 *   runtime.immune.scanOutput(output);
 */

const naturalLaw = require('./natural_law');
const phiCore = require('./phi_core');
const quantumEngine = require('./quantum_engine');
const swarm = require('./swarm');
const immuneScanner = require('./immune_scanner');
const evolutionEngine = require('./evolution_engine');
const memorySystem = require('./memory_system');

module.exports = {
  // Natural Law - Single source of truth for all constants
  ...naturalLaw,
  
  // Also re-export from phi_core for backward compatibility
  ...phiCore,

  // Quantum layer (Laws 6-12)
  quantum: quantumEngine,

  // Swarm intelligence
  swarm,

  // Immune system
  immune: immuneScanner,

  // Evolution engine
  evolution: evolutionEngine,

  // Memory system
  memory: memorySystem,
  
  // Namespaced access
  naturalLaw,
  phiCore,
};
