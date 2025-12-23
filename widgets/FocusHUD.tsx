import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Plus, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { useAppStore } from '../store';
import { SoundType } from '../types';

export const FocusHUD: React.FC = () => {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  
  // Audio State
  const [soundType, setSoundType] = useState<SoundType>(SoundType.OFF);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Tasks State
  const { tasks, addTask, toggleTask, deleteTask } = useAppStore();
  const [newTaskInput, setNewTaskInput] = useState('');

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Determine next mode
      if (mode === 'FOCUS') {
        setMode('BREAK');
        setTimeLeft(5 * 60);
      } else {
        setMode('FOCUS');
        setTimeLeft(25 * 60);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'FOCUS' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Audio Logic (Brown Noise Generator)
  useEffect(() => {
    const handleAudio = async () => {
        if (soundType === SoundType.OFF) {
            if (audioContextRef.current) {
                await audioContextRef.current.suspend();
            }
            return;
        }

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
            await ctx.resume();
        }

        // Cleanup previous noise
        if (noiseNodeRef.current) {
            noiseNodeRef.current.disconnect();
        }

        // Create Brown Noise
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        if (soundType === SoundType.BROWN_NOISE) {
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for gain loss
            }
        } 
        // Simple White/Pink approximation for Rain would go here, simplified to Brown for demo stability

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        // Lowpass filter to smooth it out further
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800;

        const gain = ctx.createGain();
        gain.gain.value = 0.15; // Volume
        gainNodeRef.current = gain;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        noise.start();
        noiseNodeRef.current = noise;
    };

    handleAudio();

    return () => {
        if(audioContextRef.current) audioContextRef.current.suspend();
    };
  }, [soundType]);


  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskInput.trim()) {
      addTask(newTaskInput);
      setNewTaskInput('');
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded-lg p-4 border border-slate-800">
        <div className="text-xs font-bold text-slate-500 tracking-widest mb-1">{mode === 'FOCUS' ? 'DEEP WORK' : 'REST'}</div>
        <div className={`text-4xl font-mono font-bold mb-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4">
          <button onClick={toggleTimer} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-200">
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button onClick={resetTimer} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-200">
            <RotateCcw size={16} />
          </button>
          <button 
            onClick={() => setSoundType(soundType === SoundType.BROWN_NOISE ? SoundType.OFF : SoundType.BROWN_NOISE)}
            className={`p-2 rounded-full transition-colors ${soundType !== SoundType.OFF ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}
          >
            <Volume2 size={16} />
          </button>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-xs uppercase text-slate-500 font-bold mb-2">Kanban Queue</div>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTaskInput}
            onChange={(e) => setNewTaskInput(e.target.value)}
            placeholder="Add task..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-800"
          />
          <button type="submit" className="bg-slate-800 p-1 rounded hover:bg-slate-700 text-slate-300">
            <Plus size={14} />
          </button>
        </form>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
          {tasks.map((task) => (
            <div key={task.id} className="group flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5 hover:border-white/10 transition-colors">
               <button onClick={() => toggleTask(task.id)} className="flex items-center gap-2 text-xs text-left truncate flex-1">
                 {task.status === 'done' ? (
                   <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                 ) : (
                   <Circle size={14} className="text-slate-600 shrink-0" />
                 )}
                 <span className={`${task.status === 'done' ? 'line-through text-slate-600' : 'text-slate-300'}`}>{task.text}</span>
               </button>
               <button onClick={() => deleteTask(task.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity">
                 <Trash2 size={12} />
               </button>
            </div>
          ))}
          {tasks.length === 0 && <div className="text-center text-[10px] text-slate-700 mt-4">No active tasks</div>}
        </div>
      </div>
    </div>
  );
};