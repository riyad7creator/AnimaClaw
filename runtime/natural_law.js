/**
 * NATURAL LAW — Single Source of Truth for ANIMA OS Constants
 * 
 * This module exports all mathematical constants and formulas
 * used throughout the system. No other file should hardcode these values.
 * 
 * Engine: SOLARIS v1.4.0
 * Constants: φ (PHI), π (PI), e (EULER)
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════════
// CORE MATHEMATICAL CONSTANTS (Immutable)
// ═══════════════════════════════════════════════════════════════════

const PHI = 1.6180339887;
const PI = 3.1415926535;
const E = 2.7182818284;

// ═══════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const PHI_SQUARED = PHI * PHI; // ≈ 2.618
const PHI_PRIMARY = 0.618;     // 1/φ
const PHI_SECONDARY = 0.382;   // 1/φ²
const HARMONIC_BRIDGE = PI / (PHI * PHI); // ≈ 1.2002

// ═══════════════════════════════════════════════════════════════════
// TIMING CONSTANTS (milliseconds where noted)
// ═══════════════════════════════════════════════════════════════════

const PULSE_INTERVAL_MS = Math.round(PI * 1000); // 3142ms
const PULSE_INTERVAL_SECONDS = PI; // 3.14159s
const COMPACTION_INTERVAL_MIN = PI * PHI; // 5.08 min
const EVOLUTION_CHECK_CYCLES = Math.floor(PI * PI); // ~10 cycles (π²)
const FULL_RESET_CYCLES = Math.floor(Math.pow(PHI, 5)); // ~11 cycles (φ⁵)

// ═══════════════════════════════════════════════════════════════════
// VITALITY THRESHOLDS
// ═══════════════════════════════════════════════════════════════════

const VITALITY_EXPAND = 1.0;
const VITALITY_MAINTAIN = 0.618;
const VITALITY_CRITICAL = 0.382;

// ═══════════════════════════════════════════════════════════════════
// FRACTAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

const MAX_FRACTAL_DEPTH = 5;
const FIBONACCI = [1, 1, 2, 3, 5, 8];

// ═══════════════════════════════════════════════════════════════════
// AGENT REGISTRY (Single Source of Truth)
// ═══════════════════════════════════════════════════════════════════

const AGENT_REGISTRY = {
  ROOT_ORCHESTRATOR: { 
    depth: 0, 
    phi_weight: 1.0, 
    parent: null,
    cycle: 'every_pulse'
  },
  PRIMARY_CELL: { 
    depth: 1, 
    phi_weight: 0.618, 
    parent: 'ROOT_ORCHESTRATOR',
    cycle: 'every_pulse'
  },
  SUPPORT_CELL: { 
    depth: 1, 
    phi_weight: 0.382, 
    parent: 'ROOT_ORCHESTRATOR',
    cycle: 'every_pulse'
  },
  MEMORY_NODE: { 
    depth: 2, 
    phi_weight: 0.146, // 0.382 * 0.382
    parent: 'SUPPORT_CELL',
    cycle: 'every_compaction'
  },
  EVOLUTION_NODE: { 
    depth: 2, 
    phi_weight: 0.236, // 0.618 * 0.382
    parent: 'SUPPORT_CELL',
    cycle: 'every_pi_squared'
  },
  IMMUNE_AGENT: { 
    depth: 2, 
    phi_weight: 0.146,
    parent: 'SUPPORT_CELL',
    cycle: 'every_pulse'
  },
};

// For backward compatibility
const CORE_AGENTS = Object.entries(AGENT_REGISTRY).map(([name, config]) => ({
  name,
  depth: config.depth,
  phi_weight: config.phi_weight
}));

// ═══════════════════════════════════════════════════════════════════
// VITALITY FORMULA (Single Implementation)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate agent vitality using the natural law formula.
 * 
 * Formula: (φ^depth × e^alignment) / (π^cycle_age) × fractal_score
 * 
 * @param {number} depth - Agent fractal depth (0-5)
 * @param {number} alignment - Mission alignment score (0-1)
 * @param {number} cycleAge - Number of cycles since spawn
 * @param {number} fractalScore - Fibonacci-based spawn score
 * @returns {number} Vitality score (clamped 0-100)
 */
function calculateVitality(depth, alignment, cycleAge, fractalScore) {
  const safeDepth = Math.max(0, Math.min(MAX_FRACTAL_DEPTH, depth || 0));
  const safeAlignment = Math.max(0, Math.min(1, alignment || 0));
  const safeCycleAge = Math.max(1, cycleAge || 1);
  const safeFractalScore = Math.max(0.001, fractalScore || 0.5);

  // Natural law formula
  const numerator = Math.pow(PHI, safeDepth) * Math.exp(safeAlignment);
  const denominator = Math.pow(PI, Math.min(safeCycleAge, 10));
  const result = (numerator / denominator) * safeFractalScore;

  return Math.max(0, Math.min(100, result));
}

/**
 * Get status based on vitality score
 * @param {number} vitality 
 * @returns {string} Status constant
 */
function getStatusFromVitality(vitality) {
  if (vitality >= VITALITY_EXPAND) return 'EXPANDING';
  if (vitality >= VITALITY_MAINTAIN) return 'ALIVE';
  if (vitality >= VITALITY_CRITICAL) return 'HEALING';
  return 'CRITICAL';
}

/**
 * Calculate harmonic bridge for timing adjustment
 * @param {number} phiWeight 
 * @returns {number} Adjusted timing
 */
function harmonicBridge(phiWeight) {
  return PI * phiWeight * HARMONIC_BRIDGE;
}

/**
 * Allocate resources using φ-weighted split (61.8/38.2)
 * @param {number} total 
 * @param {string} primaryName 
 * @param {string} secondaryName 
 * @returns {Object} Allocation map
 */
function allocateResources(total, primaryName, secondaryName) {
  return {
    [primaryName]: total * PHI_PRIMARY,
    [secondaryName]: total * PHI_SECONDARY,
  };
}

// ═══════════════════════════════════════════════════════════════════
// LOAD FROM natural_law.json (if exists) for overrides
// ═══════════════════════════════════════════════════════════════════

function loadNaturalLawJson() {
  try {
    const jsonPath = path.join(__dirname, '..', 'natural_law.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
      return data;
    }
  } catch (err) {
    console.warn('[natural_law] Could not load natural_law.json:', err.message);
  }
  return null;
}

const naturalLawJson = loadNaturalLawJson();

// ═══════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════

module.exports = {
  // Core constants
  PHI,
  PI,
  E,
  
  // Derived constants
  PHI_SQUARED,
  PHI_PRIMARY,
  PHI_SECONDARY,
  HARMONIC_BRIDGE,
  
  // Timing
  PULSE_INTERVAL_MS,
  PULSE_INTERVAL_SECONDS,
  COMPACTION_INTERVAL_MIN,
  EVOLUTION_CHECK_CYCLES,
  FULL_RESET_CYCLES,
  
  // Thresholds
  VITALITY_EXPAND,
  VITALITY_MAINTAIN,
  VITALITY_CRITICAL,
  
  // Fractal
  MAX_FRACTAL_DEPTH,
  FIBONACCI,
  
  // Agents
  AGENT_REGISTRY,
  CORE_AGENTS,
  
  // Functions
  calculateVitality,
  getStatusFromVitality,
  harmonicBridge,
  allocateResources,
  
  // Raw JSON data (if needed)
  naturalLawJson,
};
