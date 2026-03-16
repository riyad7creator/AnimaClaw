// ANIMA OS Mathematical Constants
// These are the physics of the organism — not configurable.
// 
// SOURCE OF TRUTH: runtime/natural_law.js (CommonJS)
// This file mirrors those values for Next.js/dashboard compatibility.
// When updating constants, update BOTH files to maintain consistency.

// ═══════════════════════════════════════════════════════════════════
// CORE MATHEMATICAL CONSTANTS (Immutable)
// ═══════════════════════════════════════════════════════════════════

export const PHI = 1.6180339887;
export const PI = 3.1415926535;
export const E = 2.7182818284;

// ═══════════════════════════════════════════════════════════════════
// DERIVED CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const PHI_PRIMARY = 0.618;     // 1/φ
export const PHI_SECONDARY = 0.382;   // 1/φ²
export const HARMONIC_BRIDGE = PI / (PHI * PHI); // ≈ 1.2002
export const PHI_SQUARED = PHI * PHI; // ≈ 2.618

// ═══════════════════════════════════════════════════════════════════
// TIMING CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const PULSE_INTERVAL = PI; // 3.14s
export const PULSE_INTERVAL_MS = Math.round(PI * 1000); // 3142ms
export const COMPACTION_INTERVAL_MIN = PI * PHI; // 5.08 min
export const EVOLUTION_CHECK_CYCLES = Math.floor(PI * PI); // ~10 cycles
export const FULL_RESET_CYCLES = Math.floor(Math.pow(PHI, 5)); // ~11 cycles

// ═══════════════════════════════════════════════════════════════════
// VITALITY THRESHOLDS
// ═══════════════════════════════════════════════════════════════════

export const VITALITY_EXPAND = 1.0;
export const VITALITY_MAINTAIN = 0.618;
export const VITALITY_CRITICAL = 0.382;

// ═══════════════════════════════════════════════════════════════════
// FRACTAL CONSTANTS
// ═══════════════════════════════════════════════════════════════════

export const MAX_FRACTAL_DEPTH = 5;
export const FIBONACCI = [1, 1, 2, 3, 5, 8];

// ═══════════════════════════════════════════════════════════════════
// DESIGN SYSTEM COLORS
// ═══════════════════════════════════════════════════════════════════

export const COLORS = {
  background: '#0a0a0f',
  bgLight: '#12121a',
  bgCard: '#16161f',
  gold: '#c9a84c',
  goldDim: '#8a7533',
  blue: '#4c7bc9',
  blueDim: '#3a5d99',
  green: '#4cc97b',
  red: '#c94c4c',
  text: '#e8e6e3',
  textDim: '#8a8780',
  border: '#2a2a35',
  // Green cyborg theme variants
  neonGreen: '#00ff88',
  paleGreen: '#e0ffe0',
  sageGreen: '#88cc88',
  darkGreen: '#004400',
};

// ═══════════════════════════════════════════════════════════════════
// AGENT REGISTRY (matches runtime/natural_law.js AGENT_REGISTRY)
// ═══════════════════════════════════════════════════════════════════

export const CORE_AGENTS = [
  { name: 'ROOT_ORCHESTRATOR', depth: 0, phiWeight: 1.0, role: 'Central Intelligence' },
  { name: 'PRIMARY_CELL', depth: 1, phiWeight: 0.618, role: 'Core Execution' },
  { name: 'SUPPORT_CELL', depth: 1, phiWeight: 0.382, role: 'Monitoring & Memory' },
  { name: 'MEMORY_NODE', depth: 2, phiWeight: 0.146, role: 'Persistent Memory' },
  { name: 'EVOLUTION_NODE', depth: 2, phiWeight: 0.236, role: 'Behavioral Evolution' },
  { name: 'IMMUNE_AGENT', depth: 2, phiWeight: 0.146, role: 'Security Scanner' },
];

// For lookups by name
export const AGENT_REGISTRY = {
  ROOT_ORCHESTRATOR: { depth: 0, phiWeight: 1.0 },
  PRIMARY_CELL: { depth: 1, phiWeight: 0.618 },
  SUPPORT_CELL: { depth: 1, phiWeight: 0.382 },
  MEMORY_NODE: { depth: 2, phiWeight: 0.146 },
  EVOLUTION_NODE: { depth: 2, phiWeight: 0.236 },
  IMMUNE_AGENT: { depth: 2, phiWeight: 0.146 },
};

// ═══════════════════════════════════════════════════════════════════
// VITALITY FORMULA (matches runtime/natural_law.js)
// ═══════════════════════════════════════════════════════════════════

/**
 * Calculate vitality using natural law formula
 * Formula: (φ^depth × e^alignment) / (π^cycle_age) × fractal_score
 */
export function calculateVitality(depth, alignment, cycleAge, fractalScore) {
  const safeDepth = Math.max(0, Math.min(MAX_FRACTAL_DEPTH, depth || 0));
  const safeAlignment = Math.max(0, Math.min(1, alignment || 0));
  const safeCycleAge = Math.max(1, cycleAge || 1);
  const safeFractalScore = Math.max(0.001, fractalScore || 0.5);

  const numerator = Math.pow(PHI, safeDepth) * Math.exp(safeAlignment);
  const denominator = Math.pow(PI, Math.min(safeCycleAge, 10));
  const result = (numerator / denominator) * safeFractalScore;

  return Math.max(0, Math.min(100, result));
}

export function getStatusFromVitality(vitality) {
  if (vitality >= VITALITY_EXPAND) return 'EXPANDING';
  if (vitality >= VITALITY_MAINTAIN) return 'ALIVE';
  if (vitality >= VITALITY_CRITICAL) return 'HEALING';
  return 'CRITICAL';
}

// ═══════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════

export function getStatusColor(status) {
  switch (status) {
    case 'ALIVE': return COLORS.green;
    case 'HEALING': return COLORS.gold;
    case 'EVOLVING': return COLORS.blue;
    case 'SPAWNING': return COLORS.blue;
    case 'PRUNED': return COLORS.red;
    case 'DORMANT': return COLORS.textDim;
    case 'CRITICAL': return COLORS.red;
    default: return COLORS.textDim;
  }
}

export function getVitalityColor(score) {
  if (score >= VITALITY_MAINTAIN) return COLORS.green;
  if (score >= VITALITY_CRITICAL) return COLORS.gold;
  return COLORS.red;
}

/**
 * Calculate harmonic bridge for timing
 */
export function harmonicBridge(phiWeight) {
  return PI * phiWeight * HARMONIC_BRIDGE;
}

/**
 * Allocate resources using φ-weighted split
 */
export function allocateResources(total, primaryName, secondaryName) {
  return {
    [primaryName]: total * PHI_PRIMARY,
    [secondaryName]: total * PHI_SECONDARY,
  };
}
