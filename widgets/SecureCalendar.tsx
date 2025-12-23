
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Lock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store';

export const SecureCalendar: React.FC = () => {
  const { calendarEvents, addCalendarEvent } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const startDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const handleAddEvent = () => {
      const title = prompt("Event Title (Encrypted locally):");
      if (title) {
          addCalendarEvent({
              date: currentDate.toISOString().split('T')[0],
              title,
              encrypted: true
          });
      }
  };

  return (
    <div className="h-full flex flex-col gap-2">
        <div className="flex justify-between items-center bg-slate-900 p-2 rounded">
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="text-slate-400 hover:text-white">
                <ChevronLeft size={14}/>
            </button>
            <span className="text-xs font-bold text-slate-200">
                {currentDate.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="text-slate-400 hover:text-white">
                <ChevronRight size={14}/>
            </button>
        </div>

        <div className="flex-1 grid grid-cols-7 gap-1 text-center">
            {['S','M','T','W','T','F','S'].map(d => (
                <div key={d} className="text-[10px] text-slate-500 font-bold py-1">{d}</div>
            ))}
            {Array(startDay).fill(null).map((_, i) => <div key={`empty-${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
                const day = i + 1;
                const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
                const hasEvent = calendarEvents.some(e => e.date === dateStr);
                
                return (
                    <div key={day} className="relative bg-slate-900/50 rounded flex items-center justify-center text-xs text-slate-300 hover:bg-slate-800 cursor-pointer group">
                        {day}
                        {hasEvent && <div className="absolute bottom-1 w-1 h-1 bg-emerald-500 rounded-full"></div>}
                        <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-0.5">
                            <Plus size={8} onClick={handleAddEvent} className="text-slate-400 hover:text-emerald-400"/>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-center">
            <Lock size={10} /> Earnings & Events are End-to-End Encrypted
        </div>
    </div>
  );
};
