import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, Check } from 'lucide-react';

interface Task {
  id: string;
  text: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt: number;
}

interface Board {
  backlog: Task[];
  todo: Task[];
  progress: Task[];
  done: Task[];
}

const STORAGE_KEY = 'omni-kanban-board';

const DEFAULT_BOARD: Board = {
  backlog: [{ id: 'b1', text: 'Define requirements', priority: 'low', createdAt: Date.now() }],
  todo: [
    { id: 't1', text: 'Design DB Schema', priority: 'high', createdAt: Date.now() },
    { id: 't2', text: 'Auth API', priority: 'medium', createdAt: Date.now() },
  ],
  progress: [{ id: 'p1', text: 'Frontend Shell', priority: 'medium', createdAt: Date.now() }],
  done: [{ id: 'd1', text: 'Project Setup', createdAt: Date.now() }],
};

const LANE_META: { key: keyof Board; label: string; color: string; headerColor: string }[] = [
  { key: 'backlog', label: 'Backlog', color: 'border-slate-700', headerColor: 'text-slate-400' },
  { key: 'todo', label: 'Todo', color: 'border-cyan-800/50', headerColor: 'text-cyan-400' },
  { key: 'progress', label: 'In Progress', color: 'border-fuchsia-800/50', headerColor: 'text-fuchsia-400' },
  { key: 'done', label: 'Done', color: 'border-emerald-800/50', headerColor: 'text-emerald-400' },
];

const PRIORITY_COLORS: Record<string, string> = {
  low: 'bg-sky-400',
  medium: 'bg-amber-400',
  high: 'bg-rose-500',
};

const PRIORITY_CYCLE: Array<Task['priority']> = [undefined, 'low', 'medium', 'high'];

const generateId = (): string =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

const loadBoard = (): Board => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Board;
  } catch { /* ignore */ }
  return DEFAULT_BOARD;
};

export const ProjectTracker: React.FC = () => {
  const [board, setBoard] = useState<Board>(loadBoard);
  const [addingIn, setAddingIn] = useState<keyof Board | null>(null);
  const [newTaskText, setNewTaskText] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const addInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(board)); } catch { /* ignore */ }
  }, [board]);

  useEffect(() => {
    if (addingIn) addInputRef.current?.focus();
  }, [addingIn]);

  useEffect(() => {
    if (editingId) editInputRef.current?.focus();
  }, [editingId]);

  const addTask = (lane: keyof Board) => {
    const text = newTaskText.trim();
    if (!text) { setAddingIn(null); return; }
    const task: Task = { id: generateId(), text, createdAt: Date.now() };
    setBoard(prev => ({ ...prev, [lane]: [...prev[lane], task] }));
    setNewTaskText('');
    setAddingIn(null);
  };

  const deleteTask = (lane: keyof Board, id: string) => {
    setBoard(prev => ({ ...prev, [lane]: prev[lane].filter(t => t.id !== id) }));
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditingText(task.text);
  };

  const commitEdit = (lane: keyof Board) => {
    const text = editingText.trim();
    if (text) {
      setBoard(prev => ({
        ...prev,
        [lane]: prev[lane].map(t => t.id === editingId ? { ...t, text } : t),
      }));
    }
    setEditingId(null);
    setEditingText('');
  };

  const cyclePriority = (lane: keyof Board, id: string, current: Task['priority']) => {
    const idx = PRIORITY_CYCLE.indexOf(current);
    const next = PRIORITY_CYCLE[(idx + 1) % PRIORITY_CYCLE.length];
    setBoard(prev => ({
      ...prev,
      [lane]: prev[lane].map(t => t.id === id ? { ...t, priority: next } : t),
    }));
  };

  const moveTask = (id: string, from: keyof Board, to: keyof Board) => {
    const task = board[from].find(t => t.id === id);
    if (!task || from === to) return;
    setBoard(prev => ({
      ...prev,
      [from]: prev[from].filter(t => t.id !== id),
      [to]: [...prev[to], task],
    }));
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      <div className="flex-1 flex gap-2 overflow-x-auto min-w-0">
        {LANE_META.map(({ key, label, color, headerColor }) => (
          <div
            key={key}
            className={`flex-1 min-w-[130px] bg-slate-900/50 rounded-lg border ${color} flex flex-col`}
            onDragOver={e => e.preventDefault()}
            onDrop={e => {
              const data = JSON.parse(e.dataTransfer.getData('task') || '{}');
              if (data.id && data.from !== key) moveTask(data.id, data.from as keyof Board, key);
            }}
          >
            {/* Lane header */}
            <div className="p-2 border-b border-slate-800 flex justify-between items-center shrink-0">
              <span className={`text-[10px] font-bold uppercase ${headerColor}`}>{label}</span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-slate-800 px-1.5 rounded text-slate-500 font-mono">
                  {board[key].length}
                </span>
                <button
                  onClick={() => { setAddingIn(key); setNewTaskText(''); }}
                  className="text-slate-600 hover:text-slate-300 transition-colors"
                  title={`Add task to ${label}`}
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex-1 p-2 flex flex-col gap-1.5 overflow-y-auto custom-scrollbar">
              {board[key].map(task => (
                <div
                  key={task.id}
                  className="group bg-slate-800 px-2 py-1.5 rounded border border-slate-700 hover:border-slate-600 cursor-grab active:cursor-grabbing shadow-sm transition-colors"
                  draggable
                  onDragStart={e =>
                    e.dataTransfer.setData('task', JSON.stringify({ id: task.id, from: key }))
                  }
                  onDoubleClick={() => startEdit(task)}
                >
                  {editingId === task.id ? (
                    <input
                      ref={editInputRef}
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onBlur={() => commitEdit(key)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') commitEdit(key);
                        if (e.key === 'Escape') { setEditingId(null); setEditingText(''); }
                      }}
                      className="w-full bg-slate-700 border border-slate-500 rounded px-1 py-0.5 text-[10px] text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  ) : (
                    <div className="flex items-start gap-1.5">
                      {/* Priority dot */}
                      <button
                        onClick={() => cyclePriority(key, task.id, task.priority)}
                        className={`mt-0.5 w-2 h-2 rounded-full shrink-0 transition-colors ${
                          task.priority ? PRIORITY_COLORS[task.priority] : 'bg-slate-600 hover:bg-slate-500'
                        }`}
                        title={task.priority ? `Priority: ${task.priority}` : 'No priority (click to set)'}
                      />
                      <span className="flex-1 text-[10px] text-slate-300 leading-snug break-words">
                        {task.text}
                      </span>
                      <button
                        onClick={() => deleteTask(key, task.id)}
                        className="shrink-0 opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-all"
                        title="Delete task"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Inline add input */}
              {addingIn === key && (
                <div className="mt-1">
                  <input
                    ref={addInputRef}
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') addTask(key);
                      if (e.key === 'Escape') { setAddingIn(null); setNewTaskText(''); }
                    }}
                    onBlur={() => addTask(key)}
                    placeholder="Task name..."
                    className="w-full bg-slate-700 border border-slate-600 rounded px-2 py-1 text-[10px] text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}
            </div>

            {/* Drop zone hint */}
            <div
              className="mx-2 mb-2 h-6 border border-dashed border-slate-800 rounded flex items-center justify-center text-slate-700 hover:border-slate-700 hover:text-slate-500 transition-colors shrink-0"
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('border-cyan-700', 'text-cyan-600'); }}
              onDragLeave={e => { e.currentTarget.classList.remove('border-cyan-700', 'text-cyan-600'); }}
              onDrop={e => {
                e.currentTarget.classList.remove('border-cyan-700', 'text-cyan-600');
                const data = JSON.parse(e.dataTransfer.getData('task') || '{}');
                if (data.id && data.from !== key) moveTask(data.id, data.from as keyof Board, key);
              }}
            >
              <span className="text-[9px]">drop here</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
