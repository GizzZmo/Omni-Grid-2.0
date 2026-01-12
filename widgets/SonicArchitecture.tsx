/// <reference lib="dom" />
import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  CircleDot,
  Upload,
  SkipBack,
  SkipForward,
  Repeat,
  Volume2,
  Waves,
  ListMusic,
} from 'lucide-react';

const createBrownNoiseBuffer = (ctx: AudioContext) => {
  const bufferSize = ctx.sampleRate * 2;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const output = buffer.getChannelData(0);
  let lastOut = 0;

  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    output[i] = (lastOut + 0.02 * white) / 1.02;
    lastOut = output[i];
    output[i] *= 3.5;
  }

  return buffer;
};

type Track = {
  id: number;
  name: string;
  url: string;
};

export const SonicArchitecture: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'THEORY' | 'TOOLS'>('THEORY');
  const [rootNote, setRootNote] = useState('C');
  const [bpm, setBpm] = useState(120);
  const [metronomePlaying, setMetronomePlaying] = useState(false);
  const [noiseActive, setNoiseActive] = useState(false);
  const [noiseVolume, setNoiseVolume] = useState(0.25);
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playerState, setPlayerState] = useState<'playing' | 'paused'>('paused');
  const [playerLoop, setPlayerLoop] = useState(false);
  const [playerVolume, setPlayerVolume] = useState(0.7);

  // Audio Context for Metronome & Tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const timerRef = useRef<number | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const noiseGainRef = useRef<GainNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<Track[]>([]);

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

  const ensureAudioContext = () => {
    if (!audioCtxRef.current)
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return audioCtxRef.current;
  };

  const playClick = () => {
    const ctx = ensureAudioContext();
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
    if (metronomePlaying) {
      ensureAudioContext();
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
  }, [metronomePlaying, bpm]);

  const playTone = (freq: number) => {
    const ctx = ensureAudioContext();
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

  const startBrownNoise = () => {
    const ctx = ensureAudioContext();
    if (!ctx) return;

    stopBrownNoise();

    const buffer = createBrownNoiseBuffer(ctx);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    const gain = ctx.createGain();
    gain.gain.value = noiseVolume;

    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();

    noiseSourceRef.current = source;
    noiseGainRef.current = gain;
    setNoiseActive(true);
  };

  const stopBrownNoise = () => {
    noiseSourceRef.current?.stop();
    noiseSourceRef.current?.disconnect();
    noiseGainRef.current?.disconnect();
    noiseSourceRef.current = null;
    noiseGainRef.current = null;
    setNoiseActive(false);
  };

  useEffect(() => {
    if (noiseGainRef.current) {
      noiseGainRef.current.gain.value = noiseVolume;
    }
  }, [noiseVolume]);

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const newTracks = Array.from(files).map((file, idx) => ({
      id: Date.now() + idx,
      name: file.name,
      url: URL.createObjectURL(file),
    }));

    setPlaylist(prev => {
      const updated = [...prev, ...newTracks];
      if (prev.length === 0) setCurrentTrackIndex(0);
      return updated;
    });
  };

  const togglePlayer = () => {
    if (!playlist.length || !audioRef.current) return;
    if (playerState === 'playing') {
      audioRef.current.pause();
      setPlayerState('paused');
    } else {
      setPlayerState('playing');
      audioRef.current
        .play()
        .catch(() => setPlayerState('paused'));
    }
  };

  const skipTrack = (direction: 'next' | 'prev') => {
    if (!playlist.length) return;
    setCurrentTrackIndex(idx => {
      if (direction === 'next') return (idx + 1) % playlist.length;
      return (idx - 1 + playlist.length) % playlist.length;
    });
  };

  useEffect(() => {
    const audio = audioRef.current;
    playlistRef.current = playlist;
    if (!audio) return;
    if (!playlist.length) {
      audio.pause();
      audio.removeAttribute('src');
      return;
    }

    const track = playlist[currentTrackIndex];
    if (track) {
      audio.src = track.url;
      if (playerState === 'playing') {
        audio.play().catch(() => setPlayerState('paused'));
      }
    }
  }, [currentTrackIndex, playlist, playerState]);

  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = playerVolume;
  }, [playerVolume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.loop = playerLoop;
  }, [playerLoop]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      if (playerLoop) {
        audio.currentTime = 0;
        audio.play().catch(() => setPlayerState('paused'));
        return;
      }
      if (playlist.length > 1) {
        setCurrentTrackIndex(idx => (idx + 1) % playlist.length);
        setPlayerState('playing');
      } else {
        setPlayerState('paused');
      }
    };

    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, [playerLoop, playlist.length, currentTrackIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      stopBrownNoise();
      playlistRef.current.forEach(track => URL.revokeObjectURL(track.url));
      audioCtxRef.current?.close?.();
    };
  }, []);

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
                 onClick={() => setMetronomePlaying(!metronomePlaying)}
                 className="p-2 bg-fuchsia-900/50 text-fuchsia-400 border border-fuchsia-700 rounded hover:bg-fuchsia-800"
               >
                 {metronomePlaying ? <Pause size={16} /> : <Play size={16} />}
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

           {/* Brown Noise Generator */}
           <div className="bg-slate-900 border border-slate-800 rounded p-3">
             <div className="flex items-center justify-between mb-3">
               <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                 <Waves size={12} /> Brown Noise
               </span>
               <button
                 onClick={() => (noiseActive ? stopBrownNoise() : startBrownNoise())}
                 className={`px-3 py-1 rounded text-xs font-bold border ${
                   noiseActive
                     ? 'bg-emerald-900/60 text-emerald-300 border-emerald-700'
                     : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-emerald-500/50'
                 }`}
               >
                 {noiseActive ? 'Stop' : 'Start'}
               </button>
             </div>
             <div className="flex items-center gap-3">
               <Volume2 size={14} className="text-slate-500" />
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.05"
                 value={noiseVolume}
                 onChange={e => setNoiseVolume(Number(e.target.value))}
                 aria-label="Brown noise volume"
                 className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
               />
               <span className="text-xs text-slate-400 w-12 text-right">{Math.round(noiseVolume * 100)}%</span>
             </div>
             <p className="text-[11px] text-slate-500 mt-2">
               Generates continuous brown noise that runs in the background.
             </p>
           </div>

           {/* Playlist Player */}
           <div className="bg-slate-900 border border-slate-800 rounded p-3 flex flex-col gap-3">
             <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1">
                 <ListMusic size={12} /> Playlist ({playlist.length})
               </span>
               <label
                 htmlFor="sonic-upload"
                 className="flex items-center gap-1 text-xs px-2 py-1 rounded border border-fuchsia-700 text-fuchsia-300 bg-fuchsia-900/40 cursor-pointer"
               >
                 <Upload size={12} /> Add Tracks
                 <input
                   id="sonic-upload"
                   aria-label="Add tracks"
                   type="file"
                   accept="audio/*"
                   multiple
                   className="hidden"
                   onChange={e => handleFileUpload(e.target.files)}
                 />
               </label>
             </div>

             <div className="flex items-center gap-2">
               <button
                 aria-label="Previous track"
                 onClick={() => skipTrack('prev')}
                 disabled={!playlist.length}
                 className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-50"
               >
                 <SkipBack size={14} />
               </button>
               <button
                 aria-label="Play or pause track"
                 onClick={togglePlayer}
                 disabled={!playlist.length}
                 className="flex-1 py-2 rounded bg-fuchsia-800 text-white border border-fuchsia-600 disabled:opacity-50 flex items-center justify-center gap-2"
               >
                 {playerState === 'playing' ? <Pause size={16} /> : <Play size={16} />}
                 {playerState === 'playing' ? 'Pause' : 'Play'}
               </button>
               <button
                 aria-label="Next track"
                 onClick={() => skipTrack('next')}
                 disabled={!playlist.length}
                 className="p-2 rounded bg-slate-800 text-slate-300 border border-slate-700 disabled:opacity-50"
               >
                 <SkipForward size={14} />
               </button>
               <button
                aria-label="Toggle loop"
                onClick={() => setPlayerLoop(!playerLoop)}
                aria-pressed={playerLoop}
                className={`p-2 rounded border ${
                  playerLoop
                    ? 'bg-emerald-900/70 border-emerald-600 text-emerald-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
               >
                 <Repeat size={14} />
               </button>
             </div>

             <div className="flex items-center gap-2">
               <Volume2 size={14} className="text-slate-500" />
               <input
                 type="range"
                 min="0"
                 max="1"
                 step="0.05"
                 value={playerVolume}
                 onChange={e => setPlayerVolume(Number(e.target.value))}
                 aria-label="Player volume"
                 className="flex-1 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
               />
               <span className="text-xs text-slate-400 w-12 text-right">{Math.round(playerVolume * 100)}%</span>
             </div>

             <div className="bg-slate-950 border border-slate-800 rounded p-2 h-28 overflow-auto space-y-1">
               {playlist.length === 0 ? (
                 <div className="text-xs text-slate-500 text-center">Upload audio to build your playlist.</div>
               ) : (
                 playlist.map((track, idx) => (
                   <button
                     key={track.id}
                     onClick={() => {
                       setCurrentTrackIndex(idx);
                       setPlayerState('playing');
                     }}
                     className={`w-full text-left px-2 py-1 rounded text-xs flex items-center justify-between ${
                       idx === currentTrackIndex
                         ? 'bg-fuchsia-900/60 text-fuchsia-100 border border-fuchsia-700'
                         : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-fuchsia-700/60'
                     }`}
                   >
                     <span className="truncate">{track.name}</span>
                     <span className="text-[10px] text-slate-500">{idx === currentTrackIndex ? 'Now Playing' : 'Tap to play'}</span>
                   </button>
                 ))
               )}
             </div>

             {playlist[currentTrackIndex] && (
               <div className="text-[11px] text-slate-500 flex items-center gap-2">
                 <Music size={12} className="text-fuchsia-400" />
                 <span className="truncate">
                   Now playing: <span className="text-slate-200">{playlist[currentTrackIndex].name}</span>{' '}
                   {playerLoop && <span className="text-emerald-400">(Loop)</span>}
                 </span>
               </div>
             )}
           </div>
           <audio ref={audioRef} className="hidden" />
         </div>
       )}
     </div>
   );
  };
