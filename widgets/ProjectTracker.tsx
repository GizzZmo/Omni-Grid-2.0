import React, { useState } from 'react';
import { Layout, Plus, MoreHorizontal } from 'lucide-react';

export const ProjectTracker: React.FC = () => {
  const [lanes, setLanes] = useState({
    todo: [
      { id: 1, text: 'Design DB Schema' },
      { id: 2, text: 'Auth API' },
    ],
    progress: [{ id: 3, text: 'Frontend Shell' }],
    done: [{ id: 4, text: 'Project Setup' }],
  });

  const moveTask = (id: number, from: keyof typeof lanes, to: keyof typeof lanes) => {
    const task = lanes[from].find(t => t.id === id);
    if (!task) return;
    setLanes(prev => ({
      ...prev,
      [from]: prev[from].filter(t => t.id !== id),
      [to]: [...prev[to], task],
    }));
  };

  return (
    <div className="h-full flex flex-col gap-2">
      <div className="flex-1 flex gap-2 overflow-x-auto min-w-0">
        {(Object.keys(lanes) as Array<keyof typeof lanes>).map(lane => (
          <div
            key={lane}
            className="flex-1 min-w-[140px] bg-slate-900/50 rounded-lg border border-slate-800 flex flex-col"
          >
            <div className="p-2 border-b border-slate-800 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase text-slate-400">{lane}</span>
              <span className="text-[10px] bg-slate-800 px-1.5 rounded text-slate-500">
                {lanes[lane].length}
              </span>
            </div>
            <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
              {lanes[lane].map(task => (
                <div
                  key={task.id}
                  className="bg-slate-800 p-2 rounded text-xs text-slate-300 border border-slate-700 hover:border-indigo-500 cursor-grab active:cursor-grabbing shadow-sm"
                  draggable
                  onDragStart={e =>
                    e.dataTransfer.setData('task', JSON.stringify({ id: task.id, from: lane }))
                  }
                >
                  {task.text}
                </div>
              ))}
            </div>
            {/* Drop Zone Overlay logic would go here, simplified for dragging between widgets usually, but internal DND is simulated */}
            <div
              className="h-8 m-2 border border-dashed border-slate-800 rounded flex items-center justify-center text-slate-600 hover:bg-slate-800 hover:text-slate-400 cursor-pointer"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                const data = JSON.parse(e.dataTransfer.getData('task'));
                if (data.from !== lane) moveTask(data.id, data.from, lane);
              }}
            >
              <Plus size={14} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
