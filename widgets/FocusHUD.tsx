import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  CloudRain,
  Wind,
} from 'lucide-react';
import { useAppStore } from '../store';
import { SoundType } from '../types';

// Cycles through ambient sound modes: OFF → BROWN_NOISE → RAIN → OFF
const nextSoundType = (current: SoundType): SoundType => {
  if (current === SoundType.OFF) return SoundType.BROWN_NOISE;
  if (current === SoundType.BROWN_NOISE) return SoundType.RAIN;
  return SoundType.OFF;
};

const SOUND_LABELS: Record<SoundType, string> = {
  [SoundType.OFF]: 'OFF',
  [SoundType.BROWN_NOISE]: 'BROWN',
  [SoundType.RAIN]: 'RAIN',
};

export const FocusHUD: React.FC = () => {
  // Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'FOCUS' | 'BREAK'>('FOCUS');
  const [sessions, setSessions] = useState(0);

  // Audio State
  const [soundType, setSoundType] = useState<SoundType>(SoundType.OFF);
  const [volume, setVolume] = useState(0.15);
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Tasks State
  const { tasks, addTask, toggleTask, deleteTask } = useAppStore();
  const [newTaskInput, setNewTaskInput] = useState('');

  // Timer Logic
  useEffect(() => {
    let interval: number;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Use setTimeout to defer state updates out of the effect
      setTimeout(() => {
        setIsActive(false);
        if (mode === 'FOCUS') {
          setSessions(s => s + 1);
          setMode('BREAK');
          setTimeLeft(5 * 60);
        } else {
          setMode('FOCUS');
          setTimeLeft(25 * 60);
        }
      }, 0);
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

  // Audio Logic — Brown Noise & Rain Generator
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

      // Cleanup previous noise node
      if (noiseNodeRef.current) {
        noiseNodeRef.current.disconnect();
        noiseNodeRef.current = null;
      }

      const bufferSize = ctx.sampleRate * 2; // 2-second looping buffer
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      if (soundType === SoundType.BROWN_NOISE) {
        // Brown (red) noise: each sample is a weighted sum of the previous sample
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Compensate for gain loss
        }
      } else if (soundType === SoundType.RAIN) {
        // Rain simulation: pink-noise base with random amplitude spikes
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          // Paul Kellet's pink-noise filter coefficients
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          // Add occasional amplitude spikes to simulate individual raindrops
          const drop = Math.random() < 0.002 ? (Math.random() * 2 - 1) * 0.4 : 0;
          data[i] = (pink * 0.11 + drop) * 0.5;
        }
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      // Lowpass filter to soften the texture
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = soundType === SoundType.RAIN ? 4000 : 800;

      const gain = ctx.createGain();
      gain.gain.value = volume;
      gainNodeRef.current = gain;

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
      noiseNodeRef.current = noise;
    };

    handleAudio();

    return () => {
      if (audioContextRef.current) audioContextRef.current.suspend();
    };
  }, [soundType]); // volume is intentionally excluded: a separate effect handles live gain updates without restarting the buffer

  // Live volume adjustment without restarting the noise node
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskInput.trim()) {
      addTask(newTaskInput);
      setNewTaskInput('');
    }
  };

  const SoundIcon = soundType === SoundType.RAIN ? CloudRain : soundType === SoundType.BROWN_NOISE ? Wind : VolumeX;

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Timer Section */}
      <div className="flex flex-col items-center justify-center bg-slate-950/50 rounded-lg p-4 border border-slate-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="text-xs font-bold text-slate-500 tracking-widest">
            {mode === 'FOCUS' ? 'DEEP WORK' : 'REST'}
          </div>
          {sessions > 0 && (
            <div className="text-[10px] text-cyan-600 font-mono bg-cyan-950/50 px-1.5 py-0.5 rounded">
              {sessions} {sessions === 1 ? 'session' : 'sessions'}
            </div>
          )}
        </div>
        <div
          className={`text-4xl font-mono font-bold mb-3 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}
        >
          {formatTime(timeLeft)}
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTimer}
            aria-label={isActive ? 'Pause timer' : 'Start timer'}
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-200"
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button
            onClick={resetTimer}
            aria-label="Reset timer"
            className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 text-slate-200"
          >
            <RotateCcw size={16} />
          </button>
          <button
            onClick={() => setSoundType(nextSoundType(soundType))}
            aria-label={`Ambient sound: ${SOUND_LABELS[soundType]}`}
            title={`Ambient: ${SOUND_LABELS[soundType]}`}
            className={`p-2 rounded-full transition-colors ${soundType !== SoundType.OFF ? 'bg-cyan-900/50 text-cyan-400' : 'bg-slate-800 text-slate-500'}`}
          >
            <SoundIcon size={16} />
          </button>
        </div>

        {/* Volume slider — shown only when a sound is active */}
        {soundType !== SoundType.OFF && (
          <div className="flex items-center gap-2 mt-3 w-full px-2">
            <Volume2 size={10} className="text-slate-600 shrink-0" />
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={e => setVolume(parseFloat(e.target.value))}
              aria-label="Ambient volume"
              className="flex-1 h-1 accent-cyan-500 cursor-pointer"
            />
            <span className="text-[10px] text-slate-600 w-6 text-right font-mono">
              {Math.round(volume * 100)}
            </span>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="text-xs uppercase text-slate-500 font-bold mb-2">Kanban Queue</div>
        <form onSubmit={handleAddTask} className="flex gap-2 mb-2">
          <input
            type="text"
            value={newTaskInput}
            onChange={e => setNewTaskInput(e.target.value)}
            placeholder="Add task..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:border-cyan-800"
          />
          <button
            type="submit"
            className="bg-slate-800 p-1 rounded hover:bg-slate-700 text-slate-300"
          >
            <Plus size={14} />
          </button>
        </form>
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-1 pr-1">
          {tasks.map(task => (
            <div
              key={task.id}
              className="group flex items-center justify-between p-2 bg-slate-900/50 rounded border border-white/5 hover:border-white/10 transition-colors"
            >
              <button
                onClick={() => toggleTask(task.id)}
                className="flex items-center gap-2 text-xs text-left truncate flex-1"
              >
                {task.status === 'done' ? (
                  <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                  <Circle size={14} className="text-slate-600 shrink-0" />
                )}
                <span
                  className={`${task.status === 'done' ? 'line-through text-slate-600' : 'text-slate-300'}`}
                >
                  {task.text}
                </span>
              </button>
              <button
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-[10px] text-slate-700 mt-4">No active tasks</div>
          )}
        </div>
      </div>
    </div>
  );
};
