import { useRef, useEffect, useCallback } from 'react';
import { COLORS, CORE_AGENTS } from '../../lib/constants';

// ═══════════════════════════════════════════════════════════════════
// PIXEL OFFICE — PixiJS Canvas (ANIMA OS Agent World)
// Agents appear as pixel characters in themed rooms
// Driven entirely by real Supabase data
// ═══════════════════════════════════════════════════════════════════

const AGENT_COLORS = {
  ROOT_ORCHESTRATOR: '#FFD700',
  PRIMARY_CELL: '#00FF88',
  SUPPORT_CELL: '#4C7BC9',
  MEMORY_NODE: '#C97BFF',
  EVOLUTION_NODE: '#FF6B4C',
  IMMUNE_AGENT: '#FF4C6B',
};

const AGENT_ICONS = {
  ROOT_ORCHESTRATOR: '\u2318', // ⌘
  PRIMARY_CELL: '\u25C6',      // ◆
  SUPPORT_CELL: '\u25CB',      // ○
  MEMORY_NODE: '\u2637',       // ☷
  EVOLUTION_NODE: '\u21BB',    // ↻
  IMMUNE_AGENT: '\u2694',      // ⚔
};

// Room layout — pixel positions for a 800x500 office
const ROOMS = [
  { id: 'command', label: 'Command Center', x: 40, y: 30, w: 220, h: 180, color: '#1a1a2e' },
  { id: 'execution', label: 'Execution Bay', x: 290, y: 30, w: 220, h: 180, color: '#1a2e1a' },
  { id: 'training', label: 'Training Room', x: 540, y: 30, w: 220, h: 180, color: '#2e1a1a' },
  { id: 'memory', label: 'Memory Vault', x: 40, y: 250, w: 220, h: 180, color: '#1a1a3e' },
  { id: 'security', label: 'Security Lab', x: 290, y: 250, w: 220, h: 180, color: '#2e2e1a' },
  { id: 'evolution', label: 'Evolution Chamber', x: 540, y: 250, w: 220, h: 180, color: '#2e1a2e' },
];

// Which room each agent goes to based on status
function getAgentRoom(agentName, status) {
  if (status === 'EVOLVING' || status === 'SPAWNING') return 'training';
  if (status === 'HEALING') return 'memory';
  if (status === 'QUARANTINED') return 'security';

  const homeRooms = {
    ROOT_ORCHESTRATOR: 'command',
    PRIMARY_CELL: 'execution',
    SUPPORT_CELL: 'security',
    MEMORY_NODE: 'memory',
    EVOLUTION_NODE: 'evolution',
    IMMUNE_AGENT: 'security',
  };
  return homeRooms[agentName] || 'command';
}

// Agent sprite state for smooth animation
class AgentSprite {
  constructor(name, room) {
    this.name = name;
    this.targetX = 0;
    this.targetY = 0;
    this.x = 0;
    this.y = 0;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.moveToRoom(room);
    this.x = this.targetX;
    this.y = this.targetY;
  }

  moveToRoom(room) {
    const roomDef = ROOMS.find(r => r.id === room) || ROOMS[0];
    this.targetX = roomDef.x + 40 + Math.random() * (roomDef.w - 80);
    this.targetY = roomDef.y + 50 + Math.random() * (roomDef.h - 80);
    this.currentRoom = room;
  }

  update(time) {
    // Smooth lerp toward target
    this.x += (this.targetX - this.x) * 0.03;
    this.y += (this.targetY - this.y) * 0.03;
    // Gentle bob
    this.bobY = Math.sin(time * 0.002 + this.bobOffset) * 2;
  }
}

export default function PixelOffice({ agents = [], tasks = [], logs = [] }) {
  const canvasRef = useRef(null);
  const spritesRef = useRef({});
  const animFrameRef = useRef(null);
  const tooltipRef = useRef(null);

  // Build or update sprites when agents change
  const syncSprites = useCallback((agentList) => {
    const sprites = spritesRef.current;
    agentList.forEach(agent => {
      const name = agent.branch_id || agent.name;
      const status = agent.status || 'ALIVE';
      const room = getAgentRoom(name, status);

      if (!sprites[name]) {
        sprites[name] = new AgentSprite(name, room);
      } else if (sprites[name].currentRoom !== room) {
        sprites[name].moveToRoom(room);
      }
      sprites[name].status = status;
      sprites[name].vitality = parseFloat(agent.vitality_score) || 0;
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    function resize() {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Initialize sprites from prop data
    if (agents.length > 0) {
      syncSprites(agents);
    } else {
      // Fallback: use CORE_AGENTS defaults
      syncSprites(CORE_AGENTS.map(a => ({
        branch_id: a.name, name: a.name,
        status: 'ALIVE', vitality_score: a.phiWeight,
        depth_level: a.depth,
      })));
    }

    const W = 800;
    const H = 460;

    function draw(time) {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const scaleX = cw / W;
      const scaleY = ch / H;
      const scale = Math.min(scaleX, scaleY);

      ctx.clearRect(0, 0, cw, ch);
      ctx.save();
      ctx.translate((cw - W * scale) / 2, (ch - H * scale) / 2);
      ctx.scale(scale, scale);

      // Background
      ctx.fillStyle = '#0a0a12';
      ctx.fillRect(0, 0, W, H);

      // Grid lines (pixel feel)
      ctx.strokeStyle = '#ffffff08';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 20) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 20) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Draw rooms
      ROOMS.forEach(room => {
        // Room fill
        ctx.fillStyle = room.color;
        ctx.fillRect(room.x, room.y, room.w, room.h);
        // Room border
        ctx.strokeStyle = '#ffffff20';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.x, room.y, room.w, room.h);
        // Room label
        ctx.fillStyle = '#ffffff40';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(room.label, room.x + room.w / 2, room.y + 16);
      });

      // Draw agents
      Object.entries(spritesRef.current).forEach(([name, sprite]) => {
        sprite.update(time);
        const sx = sprite.x;
        const sy = sprite.y + sprite.bobY;
        const color = AGENT_COLORS[name] || '#ffffff';
        const vitality = sprite.vitality || 0;

        // Shadow
        ctx.fillStyle = '#00000040';
        ctx.beginPath();
        ctx.ellipse(sx, sy + 18, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body (pixel character — 16x20 rect with rounded feel)
        ctx.fillStyle = color;
        ctx.fillRect(sx - 8, sy - 10, 16, 20);
        // Head
        ctx.fillStyle = color;
        ctx.fillRect(sx - 6, sy - 18, 12, 10);
        // Eyes
        ctx.fillStyle = '#000';
        ctx.fillRect(sx - 4, sy - 15, 3, 3);
        ctx.fillRect(sx + 1, sy - 15, 3, 3);

        // Status glow
        if (sprite.status === 'EVOLVING') {
          ctx.strokeStyle = '#FF6B4C80';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(sx, sy, 16 + Math.sin(time * 0.005) * 3, 0, Math.PI * 2);
          ctx.stroke();
        } else if (sprite.status === 'HEALING') {
          ctx.strokeStyle = '#FFD70060';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(sx, sy, 14, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Vitality bar above head
        const barW = 20;
        const barH = 3;
        const barX = sx - barW / 2;
        const barY = sy - 24;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barW, barH);
        const vitalFill = Math.min(1, vitality);
        ctx.fillStyle = vitality > 0.618 ? '#00ff88' : vitality > 0.382 ? '#FFD700' : '#ff4444';
        ctx.fillRect(barX, barY, barW * vitalFill, barH);

        // Name label
        ctx.fillStyle = '#ffffffa0';
        ctx.font = '8px monospace';
        ctx.textAlign = 'center';
        const shortName = name.replace('_', '\n').split('\n')[0];
        ctx.fillText(shortName, sx, sy + 30);
      });

      // Active tasks indicator (top-right)
      const activeTasks = tasks.filter(t => t.status === 'RUNNING').length;
      if (activeTasks > 0) {
        ctx.fillStyle = '#00ff8840';
        ctx.fillRect(W - 120, 5, 110, 20);
        ctx.fillStyle = '#00ff88';
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`${activeTasks} task${activeTasks > 1 ? 's' : ''} running`, W - 15, 19);
      }

      // ANIMA OS watermark
      ctx.fillStyle = '#ffffff10';
      ctx.font = '10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText('ANIMA OS — Pixel Office', 10, H - 8);

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(draw);
    }

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []); // mount once

  // Update sprites when agent data changes
  useEffect(() => {
    if (agents.length > 0) syncSprites(agents);
  }, [agents, syncSprites]);

  return (
    <div className="relative w-full h-full min-h-[300px] bg-[#0a0a12] rounded-lg overflow-hidden border border-anima-border">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ imageRendering: 'pixelated' }}
      />
      <div ref={tooltipRef} className="absolute hidden bg-black/80 text-xs text-white px-2 py-1 rounded pointer-events-none" />
    </div>
  );
}
