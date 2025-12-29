import React, { useState, useEffect, useRef } from 'react';
import { Music, Mic, Play, Pause, CircleDot } from 'lucide-react';

export const SonicArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'TOOLS'>('THEORY');
  const [rootNote, setRootNote] = useState('C');
  const [bpm, setBpm] = useState(120);
  const [playing, setPlaying] = useState(false);

  // Audio Context for Metronome & Tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);

  const NOTES = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  // Simplified circle relative to C
  const RELATIVE_MAJORS = ['C', 'G', 'D', 'A', 'E', 'B', 'Gb', 'Db', 'Ab', 'Eb', 'Bb', 'F'];
  const RELATIVE_MINORS = [
    'Am',
    'Em',
    'Bm',
    'F#m',
    'C#m',
    'G#m',
    'D#m',
    'Bbm',
    'Fm',
    'Cm',
    'Gm',
    'Dm',
  ];

  const getNeighbors = (note: string) => {
    const idx = RELATIVE_MAJORS.indexOf(note);
    if (idx === -1) return { major: [], minor: [] };

    // Circle math (wrap around)
    const left = (idx - 1 + 12) % 12;
    const right = (idx + 1) % 12;

    return {
      major: [RELATIVE_MAJORS[left], RELATIVE_MAJORS[idx], RELATIVE_MAJORS[right]],
      minor: [RELATIVE_MINORS[left], RELATIVE_MINORS[idx], RELATIVE_MINORS[right]],
    };
  };

  const chords = getNeighbors(rootNote);

  const playClick = () => {
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 1000;
    gain.gain.value = 0.5;
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  // Metronome Logic
  useEffect(() => {
    if (playing) {
      if (!audioCtxRef.current)
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      const interval = (60 / bpm) * 1000;
      timerRef.current = window.setInterval(() => {
        playClick();
      }, interval);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, bpm]);

  const playTone = (freq: number) => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 1.5);
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="flex bg-slate-900 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('THEORY')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'THEORY' ? 'bg-fuchsia-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <CircleDot size={12} /> Circle of Fifths
        </button>
        <button
          onClick={() => setActiveTab('TOOLS')}
          className={`flex-1 py-1 text-xs font-bold rounded transition-colors flex items-center justify-center gap-2 ${activeTab === 'TOOLS' ? 'bg-fuchsia-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <Music size={12} /> Tools
        </button>
      </div>

      {activeTab === 'THEORY' ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="grid grid-cols-4 gap-2 w-full mb-2">
            {RELATIVE_MAJORS.map(n => (
              <button
                key={n}
                onClick={() => setRootNote(n)}
                className={`text-xs p-1 rounded border ${rootNote === n ? 'bg-fuchsia-600 border-fuchsia-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-400'}`}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="w-full bg-slate-900/50 p-4 rounded-lg border border-slate-800">
            <div className="text-[10px] uppercase text-slate-500 font-bold mb-2 text-center">
              Compatible Chords (Key of {rootNote})
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex gap-2 justify-center">
                {chords.major?.map((c, i) => (
                  <div
                    key={c}
                    className={`w-12 h-12 flex items-center justify-center rounded font-bold text-slate-900 ${i === 1 ? 'bg-fuchsia-400 scale-110 shadow-lg shadow-fuchsia-900/50' : 'bg-fuchsia-200/70'}`}
                  >
                    {c}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 justify-center">
                {chords.minor?.map((c, i) => (
                  <div
                    key={c}
                    className={`w-12 h-12 flex items-center justify-center rounded font-bold text-slate-300 border border-slate-600 bg-slate-800`}
                  >
                    {c}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* Metronome */}
          <div className="bg-slate-900 border border-slate-800 rounded p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase">Metronome</span>
              <span className="text-xl font-mono text-fuchsia-400">{bpm} BPM</span>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setPlaying(!playing)}
                className="p-2 bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-700 rounded hover:bg-fuchsia-800"
              >
                {playing ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <input
                type="range"
                min="40"
                max="220"
                value={bpm}
                onChange={e => setBpm(Number(e.target.value))}
                className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
              />
            </div>
          </div>

          {/* Reference Tuner */}
          <div className="bg-slate-900 border border-slate-800 rounded p-3 flex-1">
            <div className="text-xs font-bold text-slate-400 uppercase mb-2">Reference Tone</div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { n: 'E2', f: 82.41 },
                { n: 'A2', f: 110.0 },
                { n: 'D3', f: 146.83 },
                { n: 'G3', f: 196.0 },
                { n: 'B3', f: 246.94 },
                { n: 'E4', f: 329.63 },
              ].map(note => (
                <button
                  key={note.n}
                  onClick={() => playTone(note.f)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-bold border border-slate-700"
                >
                  {note.n}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
