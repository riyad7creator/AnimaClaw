import { useState } from 'react';
import { COLORS } from '../../lib/constants';

// ═══════════════════════════════════════════════════════════════════
// OFFICE KANBAN — Drag-and-drop task board
// Maps to anima_task_queue rows
// ═══════════════════════════════════════════════════════════════════

const COLUMNS = [
  { key: 'QUEUED', label: 'Backlog', color: COLORS.blue },
  { key: 'RUNNING', label: 'In Progress', color: COLORS.gold },
  { key: 'DONE', label: 'Done', color: COLORS.green },
  { key: 'FAILED', label: 'Failed', color: COLORS.red },
];

export default function OfficeKanban({ tasks = [], onMoveTask }) {
  const [draggedId, setDraggedId] = useState(null);

  const grouped = {};
  COLUMNS.forEach(col => { grouped[col.key] = []; });
  tasks.forEach(task => {
    const key = task.status || 'QUEUED';
    if (grouped[key]) grouped[key].push(task);
    else grouped['QUEUED'].push(task);
  });

  function handleDragStart(e, taskId) {
    setDraggedId(taskId);
    e.dataTransfer.effectAllowed = 'move';
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDrop(e, newStatus) {
    e.preventDefault();
    if (draggedId && onMoveTask) {
      onMoveTask(draggedId, newStatus);
    }
    setDraggedId(null);
  }

  const isEmpty = tasks.length === 0;

  return (
    <div className="bg-anima-bg-card rounded-lg border border-anima-border p-3">
      <h3 className="text-sm font-semibold text-anima-text mb-3">Task Board</h3>

      {isEmpty ? (
        <div className="text-center py-8 text-xs text-anima-text-secondary">
          No tasks in queue. The system is idle.
          <br />
          <span className="text-anima-text-secondary/50">Tasks appear when agents process work.</span>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {COLUMNS.map(col => (
            <div
              key={col.key}
              onDragOver={handleDragOver}
              onDrop={e => handleDrop(e, col.key)}
              className="min-h-[120px]"
            >
              {/* Column header */}
              <div className="flex items-center gap-1.5 mb-2 pb-1 border-b border-anima-border">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col.color }} />
                <span className="text-[10px] font-semibold text-anima-text">{col.label}</span>
                <span className="text-[10px] font-mono text-anima-text-secondary ml-auto">
                  {grouped[col.key].length}
                </span>
              </div>

              {/* Cards */}
              <div className="space-y-1.5">
                {grouped[col.key].length === 0 ? (
                  <div className="text-[10px] text-anima-text-secondary/40 text-center py-4 border border-dashed border-anima-border/30 rounded">
                    Empty
                  </div>
                ) : (
                  grouped[col.key].map(task => (
                    <div
                      key={task.id}
                      draggable
                      onDragStart={e => handleDragStart(e, task.id)}
                      className={`bg-anima-bg rounded p-2 border border-anima-border cursor-move hover:border-anima-gold/30 transition-colors ${
                        draggedId === task.id ? 'opacity-50' : ''
                      }`}
                    >
                      <p className="text-[10px] text-anima-text truncate">
                        {task.task_payload?.prompt || task.task_type || 'Task'}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[9px] font-mono text-anima-gold truncate">
                          {task.agent_name}
                        </span>
                        <span className="text-[9px] font-mono text-anima-text-secondary">
                          P{task.priority || 5}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
